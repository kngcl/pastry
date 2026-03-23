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

const PRODUCT_BG = {
  crepes: { card: 'from-amber-50 to-orange-50', accent: 'text-amber-600', ring: 'ring-amber-200' },
  gaufres: { card: 'from-yellow-50 to-amber-50', accent: 'text-yellow-600', ring: 'ring-yellow-200' },
  fluffy: { card: 'from-pink-50 to-rose-50', accent: 'text-pink-600', ring: 'ring-pink-200' },
  jus: { card: 'from-emerald-50 to-teal-50', accent: 'text-emerald-600', ring: 'ring-emerald-200' },
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
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="w-32 h-32 rounded-[36px] bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center text-7xl mb-8 shadow-2xl shadow-amber-200/40">
          <span>&#x1F95E;</span>
        </div>
        <h3 className="text-3xl font-black text-gray-800 mb-3">Bienvenue!</h3>
        <p className="text-gray-400 text-center max-w-md font-medium text-base">
          Commencez par ajouter votre premier rapport de production pour voir vos statistiques ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Period Filter */}
      <div className="flex gap-2.5 flex-wrap">
        {[
          ['all', 'Tout'],
          ['week', 'Cette semaine'],
          ['month', 'Ce mois'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
              period === key
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/30 scale-[1.02]'
                : 'bg-white/80 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-lg shadow-sm border border-white/80'
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 border border-white/80">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-gray-400">{stats.days} jour{stats.days > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ─── TODAY'S HERO CARD ─── */}
      {todayStats && (
        <div className="relative overflow-hidden rounded-[32px] shadow-2xl shadow-orange-500/20">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/[0.07] rounded-full blur-md" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/[0.05] rounded-full blur-md" />

          <div className="relative p-8 md:p-10">
            {/* Title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-[14px] bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Aujourd'hui</h3>
                <p className="text-white/50 text-xs font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>

            {/* Big Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Produit', value: todayStats.totalProduced, sub: 'unites', size: 'text-3xl' },
                { label: 'Revenu', value: formatCurrency(todayStats.revenueFromNew), size: 'text-2xl' },
                { label: 'Restes vendu', value: formatCurrency(todayStats.revenueFromLeftover), sub: `${todayStats.totalLeftover} restes`, size: 'text-2xl' },
                { label: 'Cout', value: formatCurrency(todayStats.ingredientCost), size: 'text-2xl' },
                { label: 'Profit', value: formatCurrency(todayStats.profit), size: 'text-3xl' },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.12] backdrop-blur-md rounded-[20px] p-5 border border-white/[0.08] hover:bg-white/[0.18] transition-all duration-300">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em]">{item.label}</p>
                  <p className={`text-white ${item.size} font-black mt-2 tracking-tight`}>{item.value}</p>
                  {item.sub && <p className="text-white/40 text-[11px] font-semibold mt-1">{item.sub}</p>}
                </div>
              ))}
            </div>

            {/* Per-product today */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRODUCT_KEYS.map(key => {
                const ps = todayStats.productStats[key];
                if (!ps || ps.produced === 0) return null;
                return (
                  <div key={key} className="bg-white rounded-[20px] p-5 shadow-xl shadow-black/[0.06] hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-2xl">{PRODUCT_EMOJIS[key]}</span>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{PRODUCTS[key].label}</span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">{ps.produced}</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">{formatCurrency(ps.sold)}</p>
                    {ps.leftover > 0 && (
                      <p className="text-[11px] text-indigo-500 font-bold mt-1.5 bg-indigo-50 rounded-lg px-2 py-1 inline-block">
                        Restes: {ps.leftover} &rarr; {formatCurrency(ps.leftoverSold)}
                      </p>
                    )}
                    {ps.stock > 0 && (
                      <p className="text-[11px] text-orange-500 font-bold mt-1.5 bg-orange-50 rounded-lg px-2 py-1 inline-block">
                        Stock: {ps.stock}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── FINANCIAL OVERVIEW ─── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        {/* Section Header */}
        <div className="px-8 pt-8 pb-2 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Vue d'ensemble</h3>
            <p className="text-sm text-gray-400 font-medium">{stats.days} jour{stats.days > 1 ? 's' : ''} de donnees</p>
          </div>
        </div>

        {/* Big 3 numbers */}
        <div className="px-8 pt-6 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-500 to-green-600 p-6 shadow-lg shadow-emerald-500/20">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.15em]">Revenu total</p>
              <p className="text-white text-3xl font-black mt-2 tracking-tight">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-emerald-200/60 text-xs font-semibold mt-1">Moy. {formatCurrency(stats.avgRevenuePerDay)}/jour</p>
            </div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-rose-500 to-red-600 p-6 shadow-lg shadow-rose-500/20">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <p className="text-rose-100 text-[10px] font-bold uppercase tracking-[0.15em]">Cout total</p>
              <p className="text-white text-3xl font-black mt-2 tracking-tight">{formatCurrency(stats.totalCost)}</p>
            </div>
            <div className={`relative overflow-hidden rounded-[22px] p-6 shadow-lg ${stats.totalProfit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20'}`}>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.15em]">Profit total</p>
              <p className="text-white text-3xl font-black mt-2 tracking-tight">{formatCurrency(stats.totalProfit)}</p>
              <p className="text-white/50 text-xs font-semibold mt-1">Marge: {stats.avgProfitMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Smaller stat cards */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StatCard label="Total produit" value={stats.totalProduced} />
            <StatCard label="Total litres" value={`${stats.totalLiters.toFixed(1)}L`} color="blue" />
            <StatCard label="Moy. produit/jour" value={stats.avgProducedPerDay.toFixed(1)} />
            <StatCard label="Moy. profit/jour" value={formatCurrency(stats.avgProfitPerDay)} color={stats.avgProfitPerDay >= 0 ? 'green' : 'red'} />
            {stats.totalLeftoverSold > 0 && (
              <StatCard label="Vente restes" value={formatCurrency(stats.totalLeftoverSold)} color="blue" />
            )}
          </div>
        </div>

        {/* Best / Worst day */}
        {stats.bestDay && stats.days > 1 && (
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-5 bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-[20px] p-5 border border-emerald-100/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">&#x1F3C6;</div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.15em]">Meilleur jour</p>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{formatCurrency(stats.bestDay.profit)}</p>
                  <p className="text-xs text-emerald-400 font-semibold">{stats.bestDay.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-5 bg-gradient-to-r from-rose-50 to-red-50/50 rounded-[20px] p-5 border border-rose-100/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/30">&#x1F4C9;</div>
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.15em]">Jour le plus faible</p>
                  <p className="text-2xl font-black text-rose-700 mt-0.5">{formatCurrency(stats.worstDay.profit)}</p>
                  <p className="text-xs text-rose-400 font-semibold">{stats.worstDay.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── PER-PRODUCT BREAKDOWN ─── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        <div className="px-8 pt-8 pb-2 flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 className="text-xl font-black text-gray-900">Par produit</h3>
        </div>

        <div className="p-8 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCT_KEYS.map(key => {
              const pp = stats.perProduct[key];
              if (!pp) return null;
              const product = PRODUCTS[key];
              const grad = PRODUCT_GRADIENTS[key];
              const bg = PRODUCT_BG[key];
              return (
                <div key={key} className="relative overflow-hidden rounded-[22px] border border-white bg-white shadow-md hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-400 hover:-translate-y-1.5 group">
                  {/* Gradient top bar */}
                  <div className={`h-2 bg-gradient-to-r ${grad}`} />

                  {/* Decorative circle */}
                  <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${bg.card} rounded-full opacity-60 group-hover:scale-150 transition-transform duration-700`} />

                  <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl">{PRODUCT_EMOJIS[key]}</span>
                      <h4 className="font-black text-gray-800 text-lg">{product.label}</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Produites</p>
                        <p className="text-3xl font-black text-gray-800 mt-0.5">{pp.produced}</p>
                      </div>
                      <div className="h-px bg-gray-100" />
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.12em]">Revenu</p>
                          <p className="text-xl font-black text-emerald-600 mt-0.5">{formatCurrency(pp.sold)}</p>
                        </div>
                        {pp.leftoverSold > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.12em]">Restes</p>
                            <p className="text-sm font-bold text-indigo-600">{formatCurrency(pp.leftoverSold)}</p>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${pp.stock > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                        <div className={`w-2 h-2 rounded-full ${pp.stock > 0 ? 'bg-orange-400' : 'bg-gray-300'}`} />
                        <span className="text-[11px] font-bold text-gray-400 uppercase">Stock</span>
                        <span className={`ml-auto text-sm font-black ${pp.stock > 0 ? 'text-orange-600' : 'text-gray-300'}`}>
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
      </div>

      {/* ─── PER-UNIT ANALYSIS ─── */}
      {todayStats && (
        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
          <div className="px-8 pt-8 pb-2 flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Analyse par unite</h3>
              <p className="text-sm text-gray-400 font-medium">Rapport d'aujourd'hui</p>
            </div>
          </div>
          <div className="p-8 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Cout/unite" value={formatCurrency(todayStats.costPerUnit)} color="red" />
              <StatCard label="Revenu/unite" value={formatCurrency(todayStats.revenuePerUnit)} color="green" />
              <StatCard label="Profit/unite" value={formatCurrency(todayStats.profitPerUnit)} color={todayStats.profitPerUnit >= 0 ? 'green' : 'red'} />
              <StatCard label="Unites/litre" value={todayStats.unitsPerLiter.toFixed(1)} color="blue" />
              <StatCard label="Stock total" value={todayStats.totalStock} color="amber" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
