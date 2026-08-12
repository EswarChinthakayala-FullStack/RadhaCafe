import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-heading text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-bold text-foreground mt-2">Page Not Found</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to={ROUTES.PUBLIC.HOME}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-cinnamon px-4 py-2 text-xs font-bold text-white hover:bg-cinnamon/90 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
