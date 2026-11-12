// App router — all routes with lazy loading, auth guards, and custom 404
import { lazy, Suspense, type ReactNode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

// Code-split route components to shrink JavaScript bundles
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const OverviewPage = lazy(() => import('@/pages/OverviewPage'));
const StudentsPage = lazy(() => import('@/pages/StudentsPage'));
const StudentDetailPage = lazy(() => import('@/pages/StudentDetailPage'));
const PlatformsPage = lazy(() => import('@/pages/PlatformsPage'));
const CertificationsPage = lazy(() => import('@/pages/CertificationsPage'));
const EvidencePage = lazy(() => import('@/pages/EvidencePage'));
const MentorPage = lazy(() => import('@/pages/MentorPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'));
const AuditPage = lazy(() => import('@/pages/AuditPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
      <span className="text-xs font-mono text-muted-foreground animate-pulse">Initializing Nexus Node...</span>
    </div>
  );
}

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem('ctn_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  return null;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </AppShell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ThemeInit />
          <Routes>
            {/* Public */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              }
            />

            {/* Protected Core Modules */}
            <Route
              path="/"
              element={<ProtectedShell><OverviewPage /></ProtectedShell>}
            />
            <Route
              path="/students"
              element={<ProtectedShell><StudentsPage /></ProtectedShell>}
            />
            <Route
              path="/students/:id"
              element={<ProtectedShell><StudentDetailPage /></ProtectedShell>}
            />
            <Route
              path="/platforms"
              element={<ProtectedShell><PlatformsPage /></ProtectedShell>}
            />
            <Route
              path="/certifications"
              element={<ProtectedShell><CertificationsPage /></ProtectedShell>}
            />
            <Route
              path="/evidence"
              element={<ProtectedShell><EvidencePage /></ProtectedShell>}
            />
            <Route
              path="/mentor"
              element={<ProtectedShell><MentorPage /></ProtectedShell>}
            />
            <Route
              path="/analytics"
              element={<ProtectedShell><AnalyticsPage /></ProtectedShell>}
            />
            <Route
              path="/integrations"
              element={<ProtectedShell><IntegrationsPage /></ProtectedShell>}
            />
            <Route
              path="/audit"
              element={<ProtectedShell><AuditPage /></ProtectedShell>}
            />
            <Route
              path="/settings"
              element={<ProtectedShell><SettingsPage /></ProtectedShell>}
            />
            <Route
              path="/profile"
              element={<ProtectedShell><ProfilePage /></ProtectedShell>}
            />

            {/* Dedicated Custom 404 Route */}
            <Route
              path="/404"
              element={<ProtectedShell><NotFoundPage /></ProtectedShell>}
            />

            {/* Wildcard Catch-all */}
            <Route
              path="*"
              element={<ProtectedShell><NotFoundPage /></ProtectedShell>}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
