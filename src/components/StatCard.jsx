const colorMap = {
  green: {
    bg: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200/60',
    text: 'text-emerald-700',
    label: 'text-emerald-500',
    icon: 'bg-emerald-100 text-emerald-600',
  },
  red: {
    bg: 'from-rose-50 to-red-50',
    border: 'border-rose-200/60',
    text: 'text-rose-700',
    label: 'text-rose-500',
    icon: 'bg-rose-100 text-rose-600',
  },
  blue: {
    bg: 'from-sky-50 to-blue-50',
    border: 'border-sky-200/60',
    text: 'text-sky-700',
    label: 'text-sky-500',
    icon: 'bg-sky-100 text-sky-600',
  },
  amber: {
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200/60',
    text: 'text-amber-700',
    label: 'text-amber-500',
    icon: 'bg-amber-100 text-amber-600',
  },
  default: {
    bg: 'from-slate-50 to-gray-50',
    border: 'border-slate-200/60',
    text: 'text-slate-700',
    label: 'text-slate-400',
    icon: 'bg-slate-100 text-slate-600',
  },
};

export default function StatCard({ label, value, color = 'default', icon }) {
  const c = colorMap[color] || colorMap.default;
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 group`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/30 rounded-full -translate-x-4 -translate-y-8 group-hover:scale-125 transition-transform duration-500" />
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${c.label}`}>{label}</p>
      <p className={`text-2xl font-extrabold mt-1.5 tracking-tight ${c.text}`}>{value}</p>
    </div>
  );
}
