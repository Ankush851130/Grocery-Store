import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/profile';

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-soft">
          Loading authentication...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
