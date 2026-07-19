import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">404</p>
      <h2 className="text-3xl font-bold text-slate-950">Page not found</h2>
      <p className="max-w-md text-slate-600">
        The route you tried to open does not exist yet. Return to the home page to continue the scaffold.
      </p>
      <Link
        to="/"
        className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
