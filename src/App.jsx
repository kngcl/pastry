import { useState, useCallback, useEffect } from 'react';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import ReportHistory from './components/ReportHistory';
import ReportDetail from './components/ReportDetail';
import { getReports, saveReport, deleteReport } from './utils/storage';
import { PRODUCT_KEYS } from './utils/products';

const TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { key: 'Nouveau Rapport', label: 'Nouveau Rapport', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  )},
  { key: 'Historique', label: 'Historique', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
];

export default function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [editData, setEditData] = useState(null);
  const [detailReport, setDetailReport] = useState(null);

  // Load reports from Google Sheets on mount
  useEffect(() => {
    getReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const refreshReports = useCallback(async () => {
    const updated = await getReports();
    setReports(updated);
    return updated;
  }, []);

  const handleSubmit = useCallback(async (report) => {
    setSaving(true);
    try {
      await saveReport(report);
      await refreshReports();
      setActiveTab('Dashboard');
      setEditData(null);
    } catch (err) {
      alert('Erreur de sauvegarde: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [refreshReports]);

  const handleDelete = useCallback(async (date) => {
    if (!window.confirm(`Supprimer le rapport du ${date}?`)) return;
    setSaving(true);
    try {
      await deleteReport(date);
      await refreshReports();
    } catch (err) {
      alert('Erreur de suppression: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [refreshReports]);

  const handleEdit = useCallback((report) => {
    const products = {};
    for (const key of PRODUCT_KEYS) {
      const p = report.products?.[key] || {};
      products[key] = {
        liters: String(p.liters || ''),
        produced: String(p.produced || ''),
        sold: String(p.sold || ''),
        stock: String(p.stock || ''),
        leftover: String(p.leftover || ''),
        leftoverSold: String(p.leftoverSold || ''),
      };
    }
    setEditData({
      ...report,
      products,
      ingredientsUsed: Object.fromEntries(
        Object.entries(report.ingredientsUsed || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    setActiveTab('Nouveau Rapport');
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTggMHYyaC0ydi0yaDJ6bS00LTR2MmgtMnYtMmgyem0tNC00djJoLTJ2LTJoMnptOCA4djJoLTJ2LTJoMnptLTgtOHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-lg shadow-black/10">
              <span role="img" aria-label="crepe">&#x1F95E;</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Crepe Tracker
              </h1>
              <p className="text-white/70 text-sm md:text-base font-medium mt-0.5">
                Production & Vente &mdash; Crepes, Gaufres, Fluffy & Jus
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-dark border-b border-white/40 shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key !== 'Nouveau Rapport') setEditData(null); }}
                className={`flex items-center gap-2 px-4 md:px-5 py-3.5 text-sm font-semibold transition-all duration-200 border-b-[3px] ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-4">
            <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-semibold">Sauvegarde en cours...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="animate-fade-in">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Chargement des rapports...</p>
            </div>
          ) : (
            <>
              {activeTab === 'Dashboard' && <Dashboard reports={reports} />}
              {activeTab === 'Nouveau Rapport' && (
                <ReportForm
                  key={editData?.date || 'new'}
                  onSubmit={handleSubmit}
                  editData={editData}
                  reports={reports}
                />
              )}
              {activeTab === 'Historique' && (
                <ReportHistory
                  reports={reports}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              )}
            </>
          )}
        </div>
      </main>

      <ReportDetail report={detailReport} onClose={() => setDetailReport(null)} />

      {/* Footer */}
      <footer className="border-t border-gray-200/60 bg-white/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-400 font-medium">
            Crepe Tracker &mdash; Gestion de production et vente
          </p>
          <p className="text-xs text-gray-300">
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
