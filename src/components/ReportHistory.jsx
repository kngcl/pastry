import { calculateDailyStats, formatCurrency } from '../utils/calculations';
import { PRODUCTS, PRODUCT_KEYS } from '../utils/products';

const PRODUCT_EMOJIS = {
  crepes: '\uD83E\uDD5E',
  gaufres: '\uD83E\uDDC7',
  fluffy: '\uD83E\uDD5E',
  jus: '\uD83E\uDD64',
};

export default function ReportHistory({ reports, onDelete, onEdit }) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-4">
          &#x1F4CB;
        </div>
        <h3 className="text-xl font-bold text-gray-600 mb-1">Aucun rapport</h3>
        <p className="text-gray-400 text-sm">Commencez par ajouter votre premier rapport!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900">Historique</h3>
          <p className="text-sm text-gray-400">{reports.length} rapport{reports.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {reports.map((report, idx) => {
        const stats = calculateDailyStats(report);
        const activeProducts = PRODUCT_KEYS.filter(k => stats.productStats[k]?.produced > 0);

        return (
          <div
            key={report.date}
            className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-sm shadow-black/[0.03] border border-white/80 hover:shadow-xl hover:shadow-black/[0.06] transition-all duration-300 overflow-hidden group"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="p-5 md:p-6">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-sm font-extrabold text-amber-600">
                      {new Date(report.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {new Date(report.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {activeProducts.map(k => (
                        <span key={k} className="text-sm" title={PRODUCTS[k].label}>{PRODUCT_EMOJIS[k]}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(report)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDelete(report.date)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {/* Product Pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {activeProducts.map(k => {
                  const ps = stats.productStats[k];
                  return (
                    <div key={k} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-base">{PRODUCT_EMOJIS[k]}</span>
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">{ps.produced}</span>
                        <span className="text-gray-400 ml-1">{PRODUCTS[k].unit}</span>
                      </div>
                      <div className="w-px h-4 bg-gray-200" />
                      <span className="text-xs font-bold text-emerald-600">{formatCurrency(ps.sold)}</span>
                      {ps.leftover > 0 && (
                        <>
                          <div className="w-px h-4 bg-gray-200" />
                          <span className="text-xs font-semibold text-indigo-500" title="Restes de la veille vendus">
                            +{formatCurrency(ps.leftoverSold)} restes
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leftover Summary */}
              {stats.totalLeftover > 0 && (
                <div className="flex items-center gap-2 mb-4 bg-indigo-50 rounded-xl px-4 py-2.5 border border-indigo-100">
                  <span className="text-sm">&#x1F4E4;</span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {stats.totalLeftover} restes de la veille &rarr; {formatCurrency(stats.totalLeftoverSold)} vendus
                  </span>
                </div>
              )}

              {/* Financial Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Revenu</p>
                  <p className="text-base font-extrabold text-emerald-700">{formatCurrency(stats.revenue)}</p>
                </div>
                <div className="bg-rose-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Cout</p>
                  <p className="text-base font-extrabold text-rose-700">{formatCurrency(stats.ingredientCost)}</p>
                </div>
                <div className={`rounded-xl px-3 py-2.5 ${stats.profit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${stats.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>Profit</p>
                  <p className={`text-base font-extrabold ${stats.profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(stats.profit)}</p>
                </div>
                <div className="bg-sky-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Marge</p>
                  <p className="text-base font-extrabold text-sky-700">{stats.profitMargin.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
