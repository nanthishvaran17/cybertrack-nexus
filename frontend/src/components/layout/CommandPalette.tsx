// Global Command Palette & Omnisearch (Cmd+K / Ctrl+K)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Users, Globe, Award, FileCheck,
  BookOpen, BarChart2, Activity, ClipboardList, Settings,
  User, Sun, ArrowRight, X, Sparkles
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const NAVIGATION_ITEMS = [
    { label: 'Overview Dashboard', path: '/', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Student Directory', path: '/students', icon: Users, category: 'Navigation' },
    { label: 'Learning Platforms & CTF Adapters', path: '/platforms', icon: Globe, category: 'Navigation' },
    { label: 'Certifications & Accreditations', path: '/certifications', icon: Award, category: 'Navigation' },
    { label: 'Evidence Verification Desk', path: '/evidence', icon: FileCheck, category: 'Navigation' },
    { label: 'Mentor Workspace', path: '/mentor', icon: BookOpen, category: 'Navigation' },
    { label: 'Analytics & NAAC Reports', path: '/analytics', icon: BarChart2, category: 'Navigation' },
    { label: 'Integration Health & Telemetry', path: '/integrations', icon: Activity, category: 'Navigation' },
    { label: 'Audit Trail & Event Ledger', path: '/audit', icon: ClipboardList, category: 'Navigation' },
    { label: 'Department Configuration & Settings', path: '/settings', icon: Settings, category: 'Navigation' },
    { label: 'Account Security Dossier & Clearance', path: '/profile', icon: User, category: 'Account' },
  ];

  const QUICK_ACTIONS = [
    {
      label: 'Force Sync All Platform Telemetry',
      action: () => {
        navigate('/integrations');
        onClose();
      },
      icon: Activity,
      category: 'Quick Actions',
    },
    {
      label: 'Enroll New Student into Ledger',
      action: () => {
        navigate('/students');
        onClose();
      },
      icon: Users,
      category: 'Quick Actions',
    },
    {
      label: 'Review Pending Evidence Queue',
      action: () => {
        navigate('/evidence');
        onClose();
      },
      icon: FileCheck,
      category: 'Quick Actions',
    },
    {
      label: 'Link External Learning Platform Account',
      action: () => {
        navigate('/platforms');
        onClose();
      },
      icon: Globe,
      category: 'Quick Actions',
    },
    {
      label: 'Register Industry Certification',
      action: () => {
        navigate('/certifications');
        onClose();
      },
      icon: Award,
      category: 'Quick Actions',
    },
    {
      label: 'Generate Accreditation Dossier (PDF)',
      action: () => {
        navigate('/analytics');
        onClose();
      },
      icon: BarChart2,
      category: 'Quick Actions',
    },
    {
      label: 'Toggle Dark / Light Visual Mode',
      action: () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('ctn_theme', isDark ? 'dark' : 'light');
        onClose();
      },
      icon: Sun,
      category: 'Quick Actions',
    },
  ];

  const filteredNav = NAVIGATION_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = QUICK_ACTIONS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden
      />

      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-in">
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-border gap-3">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, page, or action (e.g. Students, Sync, Profile)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-4 text-sm bg-transparent border-0 focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {filteredNav.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Pages &amp; Views
              </p>
              <div className="space-y-0.5 mt-1">
                {filteredNav.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent text-xs font-medium text-foreground transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Quick Operations
              </p>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((act) => (
                  <button
                    key={act.label}
                    onClick={act.action}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent text-xs font-medium text-foreground transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <act.icon className="w-4 h-4" />
                      </div>
                      <span>{act.label}</span>
                    </div>
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-2">
            <span>[Esc] to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
