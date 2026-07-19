function AuthPageShell({ eyebrow, title, description, children, footer }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
          {eyebrow}
        </span>
        <div className="space-y-4">
          <h2 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {description}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Secure auth</p>
              <p className="mt-1 text-sm text-slate-500">JWT and cookie-backed sessions</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Reusable forms</p>
              <p className="mt-1 text-sm text-slate-500">Built with React Hook Form</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Protected routes</p>
              <p className="mt-1 text-sm text-slate-500">Ready for future modules</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {children}
        {footer ? <div className="text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
    </section>
  );
}

export default AuthPageShell;
