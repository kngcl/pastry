import { PRODUCT_KEYS } from './products';

export const INGREDIENT_PRICES = {
  eggs: 100,
  sugar_spoons: 50,
  milk_sachets: 200,
  vanilla_sugar_sachets: 100,
  vanilla_covers: 150,
  flour_kg: 500,
  oil_spoons: 50,
  butter: 500,
  baking_powder: 100,
  salt: 50,
  fruits: 300,
  water: 0,
  ice: 100,
  chocolate: 400,
  cream: 200,
  honey: 150,
};

export function calculateIngredientCost(ingredients) {
  let total = 0;
  for (const [key, val] of Object.entries(ingredients || {})) {
    total += (parseFloat(val) || 0) * (INGREDIENT_PRICES[key] || 0);
  }
  return total;
}

export function calculateDailyStats(report) {
  const ingredientCost = calculateIngredientCost(report.ingredientsUsed);

  const productStats = {};
  let totalRevenue = 0;
  let totalProduced = 0;
  let totalStock = 0;
  let totalLiters = 0;
  let totalLeftover = 0;
  let totalLeftoverSold = 0;

  for (const key of PRODUCT_KEYS) {
    const p = report.products?.[key] || {};
    const produced = parseFloat(p.produced) || 0;
    const sold = parseFloat(p.sold) || 0;
    const stock = parseFloat(p.stock) || 0;
    const liters = parseFloat(p.liters) || 0;
    const leftover = parseFloat(p.leftover) || 0;
    const leftoverSold = parseFloat(p.leftoverSold) || 0;

    totalRevenue += sold + leftoverSold;
    totalProduced += produced;
    totalStock += stock;
    totalLiters += liters;
    totalLeftover += leftover;
    totalLeftoverSold += leftoverSold;

    productStats[key] = { produced, sold, stock, liters, leftover, leftoverSold };
  }

  // Backward compat for old single-product reports
  if (!report.products) {
    totalRevenue = report.quantitySold || 0;
    totalProduced = report.crepesProduced || 0;
    totalStock = report.stockRemaining || 0;
    totalLiters = report.litersProduced || 0;
  }

  const profit = totalRevenue - ingredientCost;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const costPerUnit = totalProduced > 0 ? ingredientCost / totalProduced : 0;
  const revenuePerUnit = totalProduced > 0 ? totalRevenue / totalProduced : 0;
  const profitPerUnit = totalProduced > 0 ? profit / totalProduced : 0;
  const unitsPerLiter = totalLiters > 0 ? totalProduced / totalLiters : 0;

  return {
    ingredientCost,
    revenue: totalRevenue,
    revenueFromNew: totalRevenue - totalLeftoverSold,
    revenueFromLeftover: totalLeftoverSold,
    profit,
    profitMargin,
    costPerUnit,
    revenuePerUnit,
    profitPerUnit,
    unitsPerLiter,
    totalProduced,
    totalStock,
    totalLiters,
    totalLeftover,
    totalLeftoverSold,
    productStats,
  };
}

export function calculatePeriodStats(reports) {
  if (reports.length === 0) {
    return {
      totalRevenue: 0, totalCost: 0, totalProfit: 0,
      totalProduced: 0, totalLiters: 0, avgProfitMargin: 0,
      avgProducedPerDay: 0, avgRevenuePerDay: 0, avgProfitPerDay: 0,
      bestDay: null, worstDay: null, days: 0,
      perProduct: {}, totalLeftoverSold: 0,
    };
  }

  let totalRevenue = 0, totalCost = 0, totalProduced = 0, totalLiters = 0, totalLeftoverSold = 0;
  let bestDay = null, worstDay = null;
  const perProduct = {};

  for (const key of PRODUCT_KEYS) {
    perProduct[key] = { produced: 0, sold: 0, stock: 0, leftoverSold: 0 };
  }

  reports.forEach(report => {
    const stats = calculateDailyStats(report);
    totalRevenue += stats.revenue;
    totalCost += stats.ingredientCost;
    totalProduced += stats.totalProduced;
    totalLiters += stats.totalLiters;
    totalLeftoverSold += stats.totalLeftoverSold;

    for (const key of PRODUCT_KEYS) {
      const ps = stats.productStats[key];
      if (ps) {
        perProduct[key].produced += ps.produced;
        perProduct[key].sold += ps.sold;
        perProduct[key].stock = ps.stock;
        perProduct[key].leftoverSold += ps.leftoverSold;
      }
    }

    if (!bestDay || stats.profit > bestDay.profit) {
      bestDay = { date: report.date, profit: stats.profit };
    }
    if (!worstDay || stats.profit < worstDay.profit) {
      worstDay = { date: report.date, profit: stats.profit };
    }
  });

  const totalProfit = totalRevenue - totalCost;
  const days = reports.length;

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalProduced,
    totalLiters,
    avgProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    avgProducedPerDay: days > 0 ? totalProduced / days : 0,
    avgRevenuePerDay: days > 0 ? totalRevenue / days : 0,
    avgProfitPerDay: days > 0 ? totalProfit / days : 0,
    bestDay,
    worstDay,
    days,
    perProduct,
    totalLeftoverSold,
  };
}

export function formatCurrency(amount) {
  return `${Math.round(amount).toLocaleString()} FCFA`;
}
