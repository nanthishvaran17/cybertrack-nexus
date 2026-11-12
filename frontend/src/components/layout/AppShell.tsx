// Responsive app shell with collapsible sidebar, topbar, and role-aware nav
import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Globe, Award, FileCheck, BookOpen,
  BarChart2, Activity, ClipboardList, Settings, Shield,
  LogOut, Menu, X, Bell, ChevronDown, Moon, Sun
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

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
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['hod', 'admin'] },
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
      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold leading-none">CyberTrack</p>
            <p className="text-xs text-muted-foreground mt-0.5">Nexus</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
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
            <item.icon className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* User section */}
      {sidebarOpen && user && (
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {getInitials(user.display_name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.display_name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.roles[0]}</p>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Sign out"
              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0',
          sidebarOpen ? 'w-56' : 'w-14'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="relative flex flex-col w-64 bg-card border-r border-border animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-accent"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop sidebar collapse */}
          <button
            className="hidden lg:flex p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Breadcrumbs />

          <div className="flex-1" />

          {/* Theme */}
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
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-card" />
            </button>

            {notificationsOpen && (
              <div
                role="region"
                aria-label="Notifications Panel"
                className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 p-2 space-y-1 animate-fade-in"
              >
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border text-xs font-semibold">
                  <span>Notifications</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">2 Unread</span>
                </div>
                <div className="space-y-1 pt-1 max-h-64 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-2 rounded text-xs transition-colors hover:bg-accent/70',
                        n.unread ? 'bg-accent/40 font-medium' : 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-foreground font-semibold">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-2">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                  {getInitials(user.display_name)}
                </div>
                <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">
                  {user.display_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50 py-1 animate-fade-in"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-medium">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
