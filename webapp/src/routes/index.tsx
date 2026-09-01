import { createBrowserRouter } from 'react-router-dom';

/**
 * Route table. Pages are added here as they're built (Section 11 of the
 * implementation guide): Login/Register -> Project list -> Board detail ->
 * Task detail -> Dashboard. A ProtectedRoute wrapper will guard everything
 * except auth pages once authentication exists.
 */
function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">{label} — page not built yet</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Placeholder label="Ugnay" />,
  },
]);
