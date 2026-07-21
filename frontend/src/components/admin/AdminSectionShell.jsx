function AdminSectionShell({ title, description, actions, children }) {
  return (
    <section className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Admin</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default AdminSectionShell;
