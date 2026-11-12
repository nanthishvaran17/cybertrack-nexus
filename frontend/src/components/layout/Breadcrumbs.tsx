import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Overview',
  'students': 'Students',
  'platforms': 'Learning Platforms',
  'certifications': 'Certifications',
  'evidence': 'Evidence Verification',
  'mentor': 'Mentor Workspace',
  'analytics': 'Analytics & Reports',
  'integrations': 'Integration Health',
  'audit': 'Audit Logs',
  'settings': 'Settings',
  'login': 'Sign In',
  '404': 'Not Found',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If on login or root overview, we can show a compact breadcrumb
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-muted-foreground">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded"
        title="Go to Overview"
      >
        <Home className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">CyberTrack</span>
      </Link>

      {pathnames.length === 0 ? (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          <span className="font-medium text-foreground">Overview</span>
        </>
      ) : (
        pathnames.map((segment, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = ROUTE_LABELS[segment.toLowerCase()] || decodeURIComponent(segment);

          return (
            <div key={to} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[200px]" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={to} className="hover:text-foreground transition-colors truncate max-w-[150px]">
                  {label}
                </Link>
              )}
            </div>
          );
        })
      )}
    </nav>
  );
}
