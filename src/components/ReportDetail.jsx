import { calculateDailyStats, formatCurrency } from '../utils/calculations';
import { PRODUCTS, PRODUCT_KEYS, INGREDIENT_LABELS } from '../utils/products';

const PRODUCT_EMOJIS = {
  crepes: '\uD83E\uDD5E',
  gaufres: '\uD83E\uDDC7',
  fluffy: '\uD83E\uDD5E',
  jus: '\uD83E\uDD64',
};

const PRODUCT_GRADIENTS = {
  crepes: 'from-amber-500 to-orange-500',
  gaufres: 'from-yellow-400 to-amber-400',
  fluffy: 'from-pink-400 to-rose-400',
  jus: 'from-emerald-400 to-teal-400',
};

export default function ReportDetail({ report, onClose }) {
  if (!report) return null;
  const stats = calculateDailyStats(report);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-t-3xl p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70 text-sm font-medium">Rapport du</p>
              <h3 className="text-2xl font-extrabold text-white">
                {new Date(report.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Products */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Production</h4>
            <div className="grid grid-cols-2 gap-3">
              {PRODUCT_KEYS.map(key => {
                const ps = stats.productStats[key];
                if (!ps || ps.produced === 0) return null;
                return (
                  <div key={key} className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className={`h-1 bg-gradient-to-r ${PRODUCT_GRADIENTS[key]}`} />
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{PRODUCT_EMOJIS[key]}</span>
                        <span className="text-sm font-bold text-gray-700">{PRODUCTS[key].label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <span className="text-gray-400">Pate</span>
                        <span className="font-semibold text-gray-600 text-right">{ps.liters}L</span>
                        <span className="text-gray-400">Produites</span>
                        <span className="font-semibold text-gray-600 text-right">{ps.produced}</span>
                        <span className="text-gray-400">Vendu</span>
                        <span className="font-semibold text-emerald-600 text-right">{formatCurrency(ps.sold)}</span>
                        {ps.leftover > 0 && (
                          <>
                            <span className="text-indigo-400">Restes veille</span>
                            <span className="font-semibold text-indigo-600 text-right">{ps.leftover}</span>
                            <span className="text-indigo-400">Restes vendus</span>
                            <span className="font-semibold text-indigo-600 text-right">{formatCurrency(ps.leftoverSold)}</span>
                          </>
                        )}
                        <span className="text-gray-400">Stock</span>
                        <span className="font-semibold text-orange-500 text-right">{ps.stock}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Leftover Summary */}
          {stats.totalLeftover > 0 && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Restes de la veille</h4>
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">&#x1F4E4;</span>
                    <span className="text-sm font-semibold text-indigo-700">
                      {stats.totalLeftover} unites restantes
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-indigo-700">{formatCurrency(stats.revenueFromLeftover)}</p>
                    <p className="text-[10px] text-indigo-400 font-medium">revenu des restes</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Ingredients */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredients utilises</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(report.ingredientsUsed || {}).map(([key, val]) => (
                val > 0 && (
                  <div key={key} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-500 font-medium">{INGREDIENT_LABELS[key] || key}</span>
                    <span className="text-sm font-bold text-gray-700">{val}</span>
                  </div>
                )
              ))}
            </div>
          </section>

          {/* Financial */}
          <section>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Finances</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-emerald-400 uppercase">Revenu</p>
                <p className="text-lg font-extrabold text-emerald-700">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-rose-400 uppercase">Cout</p>
                <p className="text-lg font-extrabold text-rose-700">{formatCurrency(stats.ingredientCost)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${stats.profit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <p className={`text-[10px] font-semibold uppercase ${stats.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Profit</p>
                <p className={`text-lg font-extrabold ${stats.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(stats.profit)}</p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-sky-400 uppercase">Marge</p>
                <p className="text-lg font-extrabold text-sky-700">{stats.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Cout/unite</p>
                <p className="text-sm font-bold text-gray-700">{formatCurrency(stats.costPerUnit)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Revenu/unite</p>
                <p className="text-sm font-bold text-gray-700">{formatCurrency(stats.revenuePerUnit)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Profit/unite</p>
                <p className="text-sm font-bold text-gray-700">{formatCurrency(stats.profitPerUnit)}</p>
              </div>
            </div>
          </section>

          {/* Remaining */}
          {report.remainingIngredients?.length > 0 && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ingredients restants</h4>
              <div className="flex flex-wrap gap-2">
                {report.remainingIngredients.map(item => (
                  <span key={item} className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-xs font-semibold border border-sky-100">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Needs */}
          {report.needsForTomorrow && (
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Besoin pour demain</h4>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <p className="text-sm text-orange-700 font-medium">{report.needsForTomorrow}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
