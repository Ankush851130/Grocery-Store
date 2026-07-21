function ProductSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm animate-pulse space-y-3">
      <div className="aspect-[4/3] w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="h-5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-7 w-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default ProductSkeletonCard;
