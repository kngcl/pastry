import { useState, useEffect } from 'react';
import { PRODUCTS, PRODUCT_KEYS, INGREDIENT_LABELS, REMAINING_ITEMS, emptyProducts, emptyIngredients } from '../utils/products';

const emptyForm = () => ({
  date: new Date().toISOString().split('T')[0],
  products: emptyProducts(),
  ingredientsUsed: emptyIngredients(),
  remainingIngredients: [],
  needsForTomorrow: '',
});

const PRODUCT_THEMES = {
  crepes:  { gradient: 'from-amber-500 to-orange-500', ring: 'focus:ring-amber-300', emoji: '\uD83E\uDD5E' },
  gaufres: { gradient: 'from-yellow-400 to-amber-400', ring: 'focus:ring-yellow-300', emoji: '\uD83E\uDDC7' },
  fluffy:  { gradient: 'from-pink-400 to-rose-400', ring: 'focus:ring-pink-300', emoji: '\uD83E\uDD5E' },
  jus:     { gradient: 'from-emerald-400 to-teal-400', ring: 'focus:ring-emerald-300', emoji: '\uD83E\uDD64' },
};

const inputBase = 'w-full bg-white/80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 placeholder:text-gray-300 transition-all duration-200 focus:ring-2 focus:border-transparent focus:bg-white shadow-sm shadow-black/[0.03]';

export default function ReportForm({ onSubmit, editData, reports }) {
  const [form, setForm] = useState(editData || emptyForm());
  const [previousReport, setPreviousReport] = useState(null);

  // Load previous day's stock when date changes
  useEffect(() => {
    if (editData) return; // don't auto-fill when editing
    const target = new Date(form.date);
    const prev = (reports || [])
      .filter(r => new Date(r.date) < target)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
    setPreviousReport(prev);

    if (prev?.products) {
      setForm(f => {
        const products = { ...f.products };
        for (const key of PRODUCT_KEYS) {
          const prevStock = parseFloat(prev.products[key]?.stock) || 0;
          products[key] = {
            ...products[key],
            leftover: prevStock > 0 ? String(prevStock) : '',
            leftoverSold: products[key].leftoverSold || '',
          };
        }
        return { ...f, products };
      });
    }
  }, [form.date, editData, reports]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleProduct = (productKey, field, value) => {
    setForm(prev => ({
      ...prev,
      products: {
        ...prev.products,
        [productKey]: { ...prev.products[productKey], [field]: value },
      },
    }));
  };

  const handleIngredient = (key, value) => {
    setForm(prev => ({
      ...prev,
      ingredientsUsed: { ...prev.ingredientsUsed, [key]: value },
    }));
  };

  const toggleRemaining = (item) => {
    setForm(prev => ({
      ...prev,
      remainingIngredients: prev.remainingIngredients.includes(item)
        ? prev.remainingIngredients.filter(i => i !== item)
        : [...prev.remainingIngredients, item],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const report = {
      ...form,
      products: Object.fromEntries(
        PRODUCT_KEYS.map(k => [k, {
          liters: parseFloat(form.products[k]?.liters) || 0,
          produced: parseInt(form.products[k]?.produced) || 0,
          sold: parseFloat(form.products[k]?.sold) || 0,
          stock: parseInt(form.products[k]?.stock) || 0,
          leftover: parseInt(form.products[k]?.leftover) || 0,
          leftoverSold: parseFloat(form.products[k]?.leftoverSold) || 0,
        }])
      ),
      ingredientsUsed: Object.fromEntries(
        Object.entries(form.ingredientsUsed).map(([k, v]) => [k, parseFloat(v) || 0])
      ),
    };
    onSubmit(report);
    if (!editData) setForm(emptyForm());
  };

  const hasAnyLeftover = PRODUCT_KEYS.some(k => {
    const leftover = parseFloat(form.products[k]?.leftover) || 0;
    return leftover > 0;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editData ? 'Modifier le rapport' : 'Nouveau rapport'}
            </h2>
            <p className="text-sm text-gray-400">Remplissez les details de production du jour</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date du rapport</label>
          <input
            type="date"
            value={form.date}
            onChange={e => handleChange('date', e.target.value)}
            className={`${inputBase} focus:ring-amber-300 max-w-xs`}
            required
          />
        </div>
      </div>

      {/* Leftover from Previous Day */}
      {hasAnyLeftover && (
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">&#x1F4E4;</span>
            <div>
              <h3 className="text-lg font-bold text-white">Restes de la veille</h3>
              <p className="text-white/70 text-xs font-medium">
                Stock du {previousReport?.date || 'jour precedent'} &mdash; combien vendu aujourd'hui?
              </p>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCT_KEYS.map(key => {
                const leftover = parseFloat(form.products[key]?.leftover) || 0;
                if (leftover === 0) return null;
                const theme = PRODUCT_THEMES[key];
                const product = PRODUCTS[key];
                const leftoverSoldNum = parseFloat(form.products[key]?.leftoverSold) || 0;
                const unsold = leftover - leftoverSoldNum;

                return (
                  <div key={key} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{theme.emoji}</span>
                      <span className="text-sm font-bold text-gray-700">{product.label}</span>
                    </div>

                    <div className="flex items-center justify-between mb-3 bg-indigo-50 rounded-xl px-3 py-2 border border-indigo-100">
                      <span className="text-xs font-semibold text-indigo-500">Restants de la veille</span>
                      <span className="text-lg font-extrabold text-indigo-700">{leftover}</span>
                    </div>

                    <div className="mb-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Vendus (FCFA)
                      </label>
                      <input
                        type="number" min="0"
                        value={form.products[key]?.leftoverSold || ''}
                        onChange={e => handleProduct(key, 'leftoverSold', e.target.value)}
                        className={`${inputBase} ${theme.ring}`}
                        placeholder="0"
                      />
                    </div>

                    {leftoverSoldNum > 0 && (
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-emerald-600 font-semibold">Vendu: {formatCurrencyShort(leftoverSoldNum)}</span>
                        {unsold > 0 && <span className="text-orange-500 font-semibold">Jete/perdu: ~{unsold}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Product Cards */}
      {PRODUCT_KEYS.map((key, idx) => {
        const product = PRODUCTS[key];
        const theme = PRODUCT_THEMES[key];
        return (
          <div
            key={key}
            className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className={`bg-gradient-to-r ${theme.gradient} px-6 py-4 flex items-center gap-3`}>
              <span className="text-2xl">{theme.emoji}</span>
              <div>
                <h3 className="text-lg font-bold text-white">{product.label}</h3>
                <p className="text-white/70 text-xs font-medium">Production & ventes du jour</p>
              </div>
            </div>
            <div className="p-5 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pate (litres)</label>
                  <input
                    type="number" step="0.1" min="0"
                    value={form.products[key]?.liters || ''}
                    onChange={e => handleProduct(key, 'liters', e.target.value)}
                    className={`${inputBase} ${theme.ring}`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Produites</label>
                  <input
                    type="number" min="0"
                    value={form.products[key]?.produced || ''}
                    onChange={e => handleProduct(key, 'produced', e.target.value)}
                    className={`${inputBase} ${theme.ring}`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Vendu (FCFA)</label>
                  <input
                    type="number" min="0"
                    value={form.products[key]?.sold || ''}
                    onChange={e => handleProduct(key, 'sold', e.target.value)}
                    className={`${inputBase} ${theme.ring}`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Stock restant</label>
                  <input
                    type="number" min="0"
                    value={form.products[key]?.stock || ''}
                    onChange={e => handleProduct(key, 'stock', e.target.value)}
                    className={`${inputBase} ${theme.ring}`}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Ingredients Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">&#x1F9C2;</span>
          <div>
            <h3 className="text-lg font-bold text-white">Ingredients Utilises</h3>
            <p className="text-white/70 text-xs font-medium">Quantites consommees aujourd'hui</p>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(INGREDIENT_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
                <input
                  type="number" step="0.1" min="0"
                  value={form.ingredientsUsed[key] || ''}
                  onChange={e => handleIngredient(key, e.target.value)}
                  className={`${inputBase} focus:ring-violet-300`}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining Ingredients */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">&#x1F4E6;</span>
          <div>
            <h3 className="text-lg font-bold text-white">Ingredients Restants</h3>
            <p className="text-white/70 text-xs font-medium">Ce qui reste en stock</p>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <div className="flex flex-wrap gap-2.5">
            {REMAINING_ITEMS.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleRemaining(item)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm ${
                  form.remainingIngredients.includes(item)
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sky-200/50 scale-105'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                }`}
              >
                {form.remainingIngredients.includes(item) && (
                  <span className="mr-1">&#x2713;</span>
                )}
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Needs for Tomorrow */}
      <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-white/60 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-400 px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">&#x1F6D2;</span>
          <div>
            <h3 className="text-lg font-bold text-white">Besoin pour Demain</h3>
            <p className="text-white/70 text-xs font-medium">Liste de courses</p>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <textarea
            value={form.needsForTomorrow}
            onChange={e => handleChange('needsForTomorrow', e.target.value)}
            className={`${inputBase} focus:ring-orange-300 resize-none`}
            rows={3}
            placeholder="ex: Beurre, oeufs, farine, fruits..."
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0"
      >
        {editData ? 'Mettre a jour le rapport' : 'Enregistrer le rapport'}
      </button>
    </form>
  );
}

function formatCurrencyShort(amount) {
  return `${Math.round(amount).toLocaleString()} F`;
}
