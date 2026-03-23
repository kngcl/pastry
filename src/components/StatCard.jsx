const colorMap = {
  green: {
    bg: 'from-emerald-50 to-green-50/80',
    border: 'border-emerald-200/50',
    text: 'text-emerald-700',
    label: 'text-emerald-500/80',
  },
  red: {
    bg: 'from-rose-50 to-red-50/80',
    border: 'border-rose-200/50',
    text: 'text-rose-700',
    label: 'text-rose-500/80',
  },
  blue: {
    bg: 'from-sky-50 to-blue-50/80',
    border: 'border-sky-200/50',
    text: 'text-sky-700',
    label: 'text-sky-500/80',
  },
  amber: {
    bg: 'from-amber-50 to-orange-50/80',
    border: 'border-amber-200/50',
    text: 'text-amber-700',
    label: 'text-amber-500/80',
  },
  default: {
    bg: 'from-slate-50 to-gray-50/80',
    border: 'border-slate-200/50',
    text: 'text-slate-700',
    label: 'text-slate-400',
  },
};

export default function StatCard({ label, value, color = 'default' }) {
  const c = colorMap[color] || colorMap.default;
  return (
    <div className={`relative overflow-hidden rounded-[20px] border ${c.border} bg-gradient-to-br ${c.bg} p-5 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.04] hover:-translate-y-1 group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full -translate-x-6 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
      <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${c.label}`}>{label}</p>
      <p className={`text-2xl font-black mt-2 tracking-tight ${c.text}`}>{value}</p>
    </div>
  );
}
