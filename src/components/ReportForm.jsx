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
  crepes:  { gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', ring: 'focus:ring-amber-400', border: 'border-amber-200', emoji: '\uD83E\uDD5E', accent: 'text-amber-600' },
  gaufres: { gradient: 'from-yellow-400 to-amber-400', bg: 'bg-yellow-50', ring: 'focus:ring-yellow-400', border: 'border-yellow-200', emoji: '\uD83E\uDDC7', accent: 'text-yellow-600' },
  fluffy:  { gradient: 'from-pink-400 to-rose-400', bg: 'bg-pink-50', ring: 'focus:ring-pink-400', border: 'border-pink-200', emoji: '\uD83E\uDD5E', accent: 'text-pink-600' },
  jus:     { gradient: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', ring: 'focus:ring-emerald-400', border: 'border-emerald-200', emoji: '\uD83E\uDD64', accent: 'text-emerald-600' },
};

const inputBase = 'w-full bg-white border border-gray-200/80 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-800 placeholder:text-gray-300 transition-all duration-300 focus:ring-2 focus:ring-offset-1 focus:border-transparent focus:bg-white shadow-sm hover:border-gray-300 hover:shadow-md';

export default function ReportForm({ onSubmit, editData, reports }) {
  const [form, setForm] = useState(editData || emptyForm());
  const [previousReport, setPreviousReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    await onSubmit(report);
    if (!editData) setForm(emptyForm());
    setSubmitting(false);
  };

  const hasAnyLeftover = PRODUCT_KEYS.some(k => {
    const leftover = parseFloat(form.products[k]?.leftover) || 0;
    return leftover > 0;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      {/* Date Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 p-7">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              {editData ? 'Modifier le rapport' : 'Nouveau rapport'}
            </h2>
            <p className="text-sm text-gray-400 font-medium">Remplissez les details de production</p>
          </div>
        </div>

        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date du rapport</label>
        <input
          type="date"
          value={form.date}
          onChange={e => handleChange('date', e.target.value)}
          className={`${inputBase} focus:ring-amber-400 max-w-xs`}
          required
        />
      </div>

      {/* Leftover Section — ALWAYS visible, editable */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-7 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">&#x1F4E4;</div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Restes de la veille</h3>
            <p className="text-white/60 text-xs font-medium">
              {previousReport
                ? `Stock du ${previousReport.date} — modifiable`
                : 'Ajoutez les restes manuellement si besoin'}
            </p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCT_KEYS.map(key => {
              const theme = PRODUCT_THEMES[key];
              const product = PRODUCTS[key];
              const leftover = parseFloat(form.products[key]?.leftover) || 0;
              const leftoverSoldNum = parseFloat(form.products[key]?.leftoverSold) || 0;
              const unsold = leftover - leftoverSoldNum;

              return (
                <div key={key} className={`rounded-2xl p-4 border ${leftover > 0 ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 bg-gray-50/50'} transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{theme.emoji}</span>
                    <span className="text-sm font-bold text-gray-700">{product.label}</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Quantite restante</label>
                      <input
                        type="number" min="0"
                        value={form.products[key]?.leftover || ''}
                        onChange={e => handleProduct(key, 'leftover', e.target.value)}
                        className={`${inputBase} focus:ring-indigo-400 !py-2.5 !text-indigo-700 !font-extrabold`}
                        placeholder="0"
                      />
                    </div>

                    {leftover > 0 && (
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Vendu (FCFA)</label>
                        <input
                          type="number" min="0"
                          value={form.products[key]?.leftoverSold || ''}
                          onChange={e => handleProduct(key, 'leftoverSold', e.target.value)}
                          className={`${inputBase} focus:ring-emerald-400 !py-2.5`}
                          placeholder="0"
                        />
                      </div>
                    )}

                    {leftoverSoldNum > 0 && (
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-emerald-600 font-bold">Vendu: {formatCurrencyShort(leftoverSoldNum)}</span>
                        {unsold > 0 && <span className="text-orange-500 font-bold">Reste: {unsold}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Cards */}
      {PRODUCT_KEYS.map((key, idx) => {
        const product = PRODUCTS[key];
        const theme = PRODUCT_THEMES[key];
        return (
          <div
            key={key}
            className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className={`bg-gradient-to-r ${theme.gradient} px-7 py-5 flex items-center gap-4`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">{theme.emoji}</div>
              <div>
                <h3 className="text-lg font-extrabold text-white">{product.label}</h3>
                <p className="text-white/60 text-xs font-medium">Production & ventes du jour</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pate (litres)', field: 'liters', step: '0.1' },
                  { label: 'Produites', field: 'produced' },
                  { label: 'Vendu (FCFA)', field: 'sold' },
                  { label: 'Stock restant', field: 'stock' },
                ].map(({ label, field, step }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                    <input
                      type="number" step={step || '1'} min="0"
                      value={form.products[key]?.[field] || ''}
                      onChange={e => handleProduct(key, field, e.target.value)}
                      className={`${inputBase} ${theme.ring}`}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Ingredients Card */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-7 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">&#x1F9C2;</div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Ingredients Utilises</h3>
            <p className="text-white/60 text-xs font-medium">Quantites consommees aujourd'hui</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(INGREDIENT_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</label>
                <input
                  type="number" step="0.1" min="0"
                  value={form.ingredientsUsed[key] || ''}
                  onChange={e => handleIngredient(key, e.target.value)}
                  className={`${inputBase} focus:ring-violet-400`}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Remaining Ingredients */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 px-7 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">&#x1F4E6;</div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Ingredients Restants</h3>
            <p className="text-white/60 text-xs font-medium">Ce qui reste en stock</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2.5">
            {REMAINING_ITEMS.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleRemaining(item)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  form.remainingIngredients.includes(item)
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/25 scale-[1.03]'
                    : 'bg-gray-100/80 text-gray-500 hover:bg-gray-200 hover:text-gray-700 hover:shadow-md'
                }`}
              >
                {form.remainingIngredients.includes(item) && (
                  <span className="mr-1.5">&#x2713;</span>
                )}
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Needs for Tomorrow */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[28px] shadow-lg shadow-black/[0.03] border border-white/80 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-400 px-7 py-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">&#x1F6D2;</div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Besoin pour Demain</h3>
            <p className="text-white/60 text-xs font-medium">Liste de courses</p>
          </div>
        </div>
        <div className="p-6">
          <textarea
            value={form.needsForTomorrow}
            onChange={e => handleChange('needsForTomorrow', e.target.value)}
            className={`${inputBase} focus:ring-orange-400 resize-none !rounded-2xl`}
            rows={3}
            placeholder="ex: Beurre, oeufs, farine, fruits..."
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-extrabold py-5 rounded-[20px] transition-all duration-300 text-lg shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-1 active:translate-y-0 active:shadow-lg"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Sauvegarde...
          </span>
        ) : (
          editData ? 'Mettre a jour le rapport' : 'Enregistrer le rapport'
        )}
      </button>
    </form>
  );
}

function formatCurrencyShort(amount) {
  return `${Math.round(amount).toLocaleString()} F`;
}
