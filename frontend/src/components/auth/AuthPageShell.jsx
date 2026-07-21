import { FaBolt, FaShieldHalved, FaTag } from 'react-icons/fa6';

function AuthPageShell({ eyebrow, title, description, children, footer }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-160px)] max-w-6xl items-center gap-12 py-8 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-8">
        <div className="space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur shadow-soft">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <FaBolt className="text-amber-500" />
              <span>{eyebrow}</span>
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl lg:text-5xl leading-[1.15]">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg font-medium">
            {description}
          </p>
        </div>

        {/* CUSTOMER BENEFIT CARDS */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-soft backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 p-4 border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <FaBolt className="text-base shrink-0" />
                <p className="text-sm font-black">10-Min Delivery</p>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Superfast doorstep delivery across all categories
              </p>
            </div>

            <div className="rounded-2xl bg-indigo-500/10 dark:bg-indigo-950/40 p-4 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <FaTag className="text-base shrink-0" />
                <p className="text-sm font-black">Exclusive Savings</p>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Member-only coupons, deals & instant cashback
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 p-4 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <FaShieldHalved className="text-base shrink-0" />
                <p className="text-sm font-black">100% Genuine</p>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Authentic electronics, smartphones & fresh produce
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {children}
        {footer ? <div className="text-center text-sm text-slate-700 dark:text-slate-300 font-medium">{footer}</div> : null}
      </div>
    </section>
  );
}

export default AuthPageShell;
