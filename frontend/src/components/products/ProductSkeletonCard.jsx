function ProductSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-soft animate-pulse">
      <div className="aspect-[4/3] bg-slate-200" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
        <div className="h-4 w-2/3 rounded-full bg-slate-200" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 w-24 rounded-full bg-slate-200" />
          <div className="h-10 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default ProductSkeletonCard;
