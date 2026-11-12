import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Search, Compass, Terminal, RefreshCw } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

export default function NotFoundPage() {
  const navigate = useNavigate();

  useSEO({
    title: '404 — Node Not Found',
    description: 'The requested route or platform endpoint could not be resolved within the CyberTrack Nexus network.',
    canonicalPath: '/404',
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Visual Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative p-5 rounded-2xl bg-card border border-border shadow-xl">
            <ShieldAlert className="w-14 h-14 text-primary animate-bounce-short" />
          </div>
        </div>

        {/* Semantic H1 and Subtitle */}
        <div className="space-y-2">
          <p className="text-xs font-mono font-semibold uppercase tracking-widest text-primary">
            HTTP Status 404 • Routing Exception
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Node Not Located in Nexus Mesh
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            The requested URI path is invalid, disconnected, or has been relocated to an air-gapped subnet.
          </p>
        </div>

        {/* Cyber Terminal Diagnostics */}
        <div className="text-left bg-card/80 border border-border rounded-lg p-4 font-mono text-xs text-muted-foreground shadow-inner overflow-x-auto">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/60 text-muted-foreground/70">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>telemetry://mesh-router/diagnostics</span>
          </div>
          <div className="space-y-1 text-xs">
            <p><span className="text-destructive font-semibold">FAIL:</span> URI resolution fault at boundary ingress</p>
            <p><span className="text-primary font-semibold">TRACE:</span> 0x7F...ROUTE_DISPATCH_UNRESOLVED</p>
            <p><span className="text-muted-foreground font-semibold">STATUS:</span> TLS 1.3 OK • Auth: Passed • Subnet: Department of CSE (Cyber Security)</p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Return to Overview
          </Link>
          <Link
            to="/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Student Directory
          </Link>
        </div>

        {/* Internal Hub Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
            Quick Navigation Hub
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link to="/platforms" className="px-3 py-1.5 rounded-md bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primary" />
              Learning Platforms
            </Link>
            <Link to="/certifications" className="px-3 py-1.5 rounded-md bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              Certifications
            </Link>
            <Link to="/evidence" className="px-3 py-1.5 rounded-md bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              Evidence Verification
            </Link>
            <Link to="/analytics" className="px-3 py-1.5 rounded-md bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              Analytics &amp; Reports
            </Link>
            <Link to="/integrations" className="px-3 py-1.5 rounded-md bg-accent/60 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
              Sync Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
