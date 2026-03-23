import { useState, useCallback, useEffect } from 'react';
import ReportForm from './components/ReportForm';
import Dashboard from './components/Dashboard';
import ReportHistory from './components/ReportHistory';
import ReportDetail from './components/ReportDetail';
import { getReports, saveReport, deleteReport } from './utils/storage';
import { PRODUCT_KEYS } from './utils/products';

const TABS = [
  { key: 'Dashboard', label: 'Dashboard', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { key: 'Nouveau Rapport', label: 'Nouveau', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
  )},
  { key: 'Historique', label: 'Historique', icon: (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
];

export default function App() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [editData, setEditData] = useState(null);
  const [detailReport, setDetailReport] = useState(null);

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
    <div className="min-h-screen bg-[#f7f6f3]">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -right-48 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-orange-200/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-rose-200/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-10 md:py-12">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-2xl shadow-black/10 border border-white/20">
              <span role="img" aria-label="crepe">&#x1F95E;</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Crepe Tracker
              </h1>
              <p className="text-white/60 text-sm md:text-base font-medium mt-1">
                Production & Vente &mdash; Crepes, Gaufres, Fluffy & Jus
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-dark border-b border-black/[0.04] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); if (tab.key !== 'Nouveau Rapport') setEditData(null); }}
                className={`flex items-center gap-2.5 px-5 md:px-6 py-4 text-sm font-bold transition-all duration-300 border-b-[3px] ${
                  activeTab === tab.key
                    ? 'border-amber-500 text-amber-700 bg-amber-50/60'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/60'
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
        <div className="fixed inset-0 bg-black/25 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white rounded-[24px] px-8 py-6 shadow-2xl flex items-center gap-4 animate-scale-in">
            <div className="w-7 h-7 border-[3px] border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-gray-800 font-bold text-base">Sauvegarde en cours...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-5" />
            <p className="text-gray-400 font-semibold text-base">Chargement des rapports...</p>
          </div>
        ) : (
          <div className="animate-fade-in">
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
          </div>
        )}
      </main>

      <ReportDetail report={detailReport} onClose={() => setDetailReport(null)} />

      {/* Footer */}
      <footer className="border-t border-black/[0.04] bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-400 font-medium">
            Crepe Tracker &mdash; Gestion de production et vente
          </p>
          <p className="text-xs text-gray-300 font-medium">
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
