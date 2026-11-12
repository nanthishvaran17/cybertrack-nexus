// Responsive world-class app shell with collapsible sidebar, topbar, command palette, and role-aware nav
import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Globe, Award, FileCheck, BookOpen,
  BarChart2, Activity, ClipboardList, Settings, Shield,
  LogOut, Menu, X, Bell, ChevronDown, Moon, Sun, Zap, Search,
  Command
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CommandPalette } from '@/components/layout/CommandPalette';

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Students', href: '/students', icon: Users, roles: ['hod', 'admin', 'staff'] },
  { label: 'Learning Platforms', href: '/platforms', icon: Globe },
  { label: 'Certifications', href: '/certifications', icon: Award },
  { label: 'Evidence Verification', href: '/evidence', icon: FileCheck, roles: ['hod', 'admin', 'staff'] },
  { label: 'Mentor Workspace', href: '/mentor', icon: BookOpen, roles: ['hod', 'admin', 'staff'] },
  { label: 'Analytics & Reports', href: '/analytics', icon: BarChart2, roles: ['hod', 'admin', 'staff'] },
  { label: 'Integration Health', href: '/integrations', icon: Activity, roles: ['hod', 'admin'] },
  { label: 'Audit Logs', href: '/audit', icon: ClipboardList, roles: ['hod'] },
  { label: 'Department Settings', href: '/settings', icon: Settings, roles: ['hod', 'admin'] },
  { label: 'Account & Clearance', href: '/profile', icon: Shield },
];

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setDark((v) => !v);
    localStorage.setItem('ctn_theme', !dark ? 'dark' : 'light');
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-lg bg-card/80 border border-border/80 hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all duration-200"
    >
      {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const NOTIFICATIONS = [
    { id: '1', title: 'New Certificate Submitted', text: 'Dharun Kumar submitted TryHackMe Pre-Security proof.', time: '10m ago', unread: true },
    { id: '2', title: 'Telemetry Sync Completed', text: '184 records updated from LeetCode & GitHub.', time: '1h ago', unread: true },
    { id: '3', title: 'Intervention Flag Resolved', text: 'Bhavani K logged 2 completed labs.', time: '3h ago', unread: false },
  ];

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.some((r) => hasRole(r as never))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <nav className="flex flex-col h-full bg-card/95 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-4 py-4.5 border-b border-border/80">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/40 shadow-sm shrink-0">
          <Shield className="w-5 h-5 text-primary" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-ping" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-foreground">CyberTrack</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/15 text-primary font-bold">NEXUS</span>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground truncate tracking-wide mt-0.5">
              Nandha Engineering College
            </p>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {sidebarOpen && (
          <p className="px-3 pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/70">
            Command Modules
          </p>
        )}
        {visibleNav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn('sidebar-link', isActive && 'active')
            }
          >
            <item.icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* System Status Indicator */}
      {sidebarOpen && (
        <div className="px-3 py-2 mx-2 mb-2 rounded-lg bg-muted/40 border border-border/60 text-[10px] flex items-center justify-between font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-muted-foreground">SOC NODE: ONLINE</span>
          </div>
          <span className="text-emerald-400 font-semibold">TLS 1.3</span>
        </div>
      )}

      {/* User Footer */}
      {user && (
        <div className="border-t border-border/80 p-3">
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-accent/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {getInitials(user.display_name)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.display_name}</p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-mono tracking-wider font-semibold text-primary">
                  {user.roles[0]}
                </p>
              </div>
            )}
          </Link>
        </div>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden cyber-grid">
      {/* Global Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border/80 transition-all duration-200 shrink-0 z-30',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative flex flex-col w-64 bg-card border-r border-border animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Glassmorphic Topbar */}
        <header className="h-14 flex items-center gap-3 px-5 border-b border-border/80 bg-card/65 backdrop-blur-xl shrink-0 z-20">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar collapse */}
          <button
            className="hidden lg:flex p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Breadcrumbs />

          {/* Omnisearch Command Bar Trigger */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/10 hover:border-primary/40 text-xs text-slate-400 hover:text-white transition-all ml-2"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">Search or jump...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-white/10 text-slate-300">
              Ctrl K
            </kbd>
          </button>

          <div className="flex-1" />

          {/* Department Badge + SLA Status (unified & compact) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">CSE (Cyber Security)</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">99.98% SLA</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen((v) => !v);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              className="p-2 rounded-lg bg-card/80 border border-border/80 hover:border-primary/40 text-muted-foreground hover:text-foreground relative transition-all duration-200"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
            </button>

            {notificationsOpen && (
              <div
                role="region"
                aria-label="Notifications Panel"
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 p-3 space-y-1 animate-fade-in backdrop-blur-xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span>Real-Time Telemetry Alerts</span>
                  </div>
                  <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-mono font-bold">2 New</span>
                </div>
                <div className="space-y-1.5 pt-1.5 max-h-72 overflow-y-auto pr-1">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-2.5 rounded-lg text-xs transition-colors hover:bg-accent/60 border border-transparent',
                        n.unread ? 'bg-primary/5 border-primary/20' : 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-foreground font-semibold">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{n.time}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-1 line-clamp-2">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent/70 border border-transparent hover:border-border transition-all text-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {getInitials(user.display_name)}
                </div>
                <span className="hidden md:block text-xs font-semibold text-foreground truncate max-w-[120px]">
                  {user.display_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 py-1.5 animate-fade-in backdrop-blur-xl divide-y divide-border/60"
                >
                  <div className="px-3.5 py-2.5">
                    <p className="text-xs font-bold text-foreground truncate">{user.display_name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{user.email}</p>
                    <span className="inline-block text-[10px] font-mono px-2 py-0.5 mt-1 rounded bg-primary/10 text-primary font-semibold uppercase">
                      Clearance: {user.roles[0]}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      Account &amp; Clearance Dossier
                    </Link>
                    <Link
                      to="/settings"
                      role="menuitem"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      Department Settings
                    </Link>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        setCommandOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      <Command className="w-3.5 h-3.5 text-muted-foreground" />
                      Command Omnisearch (Ctrl+K)
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out of session
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Page Content with Silk Smooth Scroll */}
        <main className="flex-1 smooth-scroll p-6 md:p-8" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
