function AdminBadge({ children, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    brand: 'bg-brand-50 text-brand-700',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone] || toneClasses.neutral}`}>
      {children}
    </span>
  );
}

export default AdminBadge;
