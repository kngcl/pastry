import { useMemo, useState } from 'react';
import { calculateDailyStats, calculatePeriodStats, formatCurrency } from '../utils/calculations';
import { PRODUCTS, PRODUCT_KEYS } from '../utils/products';
import StatCard from './StatCard';

const PRODUCT_GRADIENTS = {
  crepes: 'from-amber-500 to-orange-500',
  gaufres: 'from-yellow-400 to-amber-400',
  fluffy: 'from-pink-400 to-rose-400',
  jus: 'from-emerald-400 to-teal-400',
};

const PRODUCT_EMOJIS = {
  crepes: '\uD83E\uDD5E',
  gaufres: '\uD83E\uDDC7',
  fluffy: '\uD83E\uDD5E',
  jus: '\uD83E\uDD64',
};

export default function Dashboard({ reports }) {
  const [period, setPeriod] = useState('all');

  const filteredReports = useMemo(() => {
    const now = new Date();
    return reports.filter(r => {
      const d = new Date(r.date);
      if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
      }
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [reports, period]);

  const stats = useMemo(() => calculatePeriodStats(filteredReports), [filteredReports]);

  const todayReport = reports.find(r => r.date === new Date().toISOString().split('T')[0]);
  const todayStats = todayReport ? calculateDailyStats(todayReport) : null;

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-6xl mb-6 shadow-lg shadow-amber-100/50">
          <span>&#x1F95E;</span>
        </div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">Bienvenue!</h3>
        <p className="text-gray-400 text-center max-w-md font-medium">
          Commencez par ajouter votre premier rapport de production pour voir vos statistiques ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Period Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          ['all', 'Tout', '&#x1F4CA;'],
          ['week', 'Cette semaine', '&#x1F4C5;'],
          ['month', 'Ce mois', '&#x1F5D3;'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              period === key
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm shadow-black/5 border border-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Today's Summary */}
      {todayStats && (
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-[28px] p-7 md:p-8 shadow-xl shadow-orange-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white/90">Aujourd'hui</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total produit', value: todayStats.totalProduced, sub: 'unites' },
                { label: 'Revenu (nouveau)', value: formatCurrency(todayStats.revenueFromNew) },
                { label: 'Revenu (restes)', value: formatCurrency(todayStats.revenueFromLeftover), sub: `${todayStats.totalLeftover} restes` },
                { label: 'Cout', value: formatCurrency(todayStats.ingredientCost) },
                { label: 'Profit', value: formatCurrency(todayStats.profit) },
              ].map((item, i) => (
                <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="text-white text-xl md:text-2xl font-extrabold mt-1">{item.value}</p>
                  {item.sub && <p className="text-white/50 text-xs mt-0.5">{item.sub}</p>}
                </div>
              ))}
            </div>

            {/* Per-product today */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRODUCT_KEYS.map(key => {
                const ps = todayStats.productStats[key];
                if (!ps || ps.produced === 0) return null;
                return (
                  <div key={key} className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{PRODUCT_EMOJIS[key]}</span>
                      <span className="text-xs font-bold text-gray-500 uppercase">{PRODUCTS[key].label}</span>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-800">{ps.produced}</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-0.5">{formatCurrency(ps.sold)}</p>
                    {ps.leftover > 0 && (
                      <p className="text-xs text-indigo-500 font-medium mt-0.5">
                        Restes: {ps.leftover} &rarr; {formatCurrency(ps.leftoverSold)}
                      </p>
                    )}
                    {ps.stock > 0 && <p className="text-xs text-orange-500 font-medium mt-0.5">Stock: {ps.stock}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Period Overview */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 p-7 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900">Vue d'ensemble</h3>
            <p className="text-sm text-gray-400">{stats.days} jour{stats.days > 1 ? 's' : ''} de donnees</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Revenu total" value={formatCurrency(stats.totalRevenue)} color="green" />
          <StatCard label="Cout total" value={formatCurrency(stats.totalCost)} color="red" />
          <StatCard label="Profit total" value={formatCurrency(stats.totalProfit)} color={stats.totalProfit >= 0 ? 'green' : 'red'} />
          <StatCard label="Marge" value={`${stats.avgProfitMargin.toFixed(1)}%`} color="blue" />
          <StatCard label="Total produit" value={stats.totalProduced} />
          <StatCard label="Total litres" value={`${stats.totalLiters.toFixed(1)}L`} color="blue" />
          <StatCard label="Moy. produit/jour" value={stats.avgProducedPerDay.toFixed(1)} />
          <StatCard label="Moy. revenu/jour" value={formatCurrency(stats.avgRevenuePerDay)} color="green" />
          <StatCard label="Moy. profit/jour" value={formatCurrency(stats.avgProfitPerDay)} color={stats.avgProfitPerDay >= 0 ? 'green' : 'red'} />
          {stats.totalLeftoverSold > 0 && (
            <StatCard label="Vente restes total" value={formatCurrency(stats.totalLeftoverSold)} color="blue" />
          )}
        </div>

        {stats.bestDay && stats.days > 1 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">&#x1F3C6;</div>
              <div>
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Meilleur jour</p>
                <p className="text-lg font-extrabold text-emerald-700">{formatCurrency(stats.bestDay.profit)}</p>
                <p className="text-xs text-emerald-500/80">{stats.bestDay.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl p-4 border border-rose-100">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-lg">&#x1F4C9;</div>
              <div>
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Jour le plus faible</p>
                <p className="text-lg font-extrabold text-rose-700">{formatCurrency(stats.worstDay.profit)}</p>
                <p className="text-xs text-rose-500/80">{stats.worstDay.date}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Per-Product Breakdown */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 p-7 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">Par produit</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCT_KEYS.map(key => {
            const pp = stats.perProduct[key];
            if (!pp) return null;
            const product = PRODUCTS[key];
            const grad = PRODUCT_GRADIENTS[key];
            return (
              <div key={key} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className={`h-1.5 bg-gradient-to-r ${grad}`} />
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="text-2xl">{PRODUCT_EMOJIS[key]}</span>
                    <h4 className="font-bold text-gray-800">{product.label}</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Produites</span>
                      <span className="text-lg font-extrabold text-gray-700">{pp.produced}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Revenu</span>
                      <span className="text-lg font-extrabold text-emerald-600">{formatCurrency(pp.sold)}</span>
                    </div>
                    {pp.leftoverSold > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-indigo-400 uppercase">Vente restes</span>
                        <span className="text-sm font-bold text-indigo-600">{formatCurrency(pp.leftoverSold)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Stock</span>
                      <span className={`text-sm font-bold ${pp.stock > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                        {pp.stock > 0 ? pp.stock : 'Vide'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Unit Analysis */}
      {todayStats && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 p-7 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">Analyse par unite</h3>
              <p className="text-sm text-gray-400">Rapport d'aujourd'hui</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Cout/unite" value={formatCurrency(todayStats.costPerUnit)} color="red" />
            <StatCard label="Revenu/unite" value={formatCurrency(todayStats.revenuePerUnit)} color="green" />
            <StatCard label="Profit/unite" value={formatCurrency(todayStats.profitPerUnit)} color={todayStats.profitPerUnit >= 0 ? 'green' : 'red'} />
            <StatCard label="Unites/litre" value={todayStats.unitsPerLiter.toFixed(1)} color="blue" />
            <StatCard label="Stock total" value={todayStats.totalStock} color="amber" />
          </div>
        </div>
      )}
    </div>
  );
}
