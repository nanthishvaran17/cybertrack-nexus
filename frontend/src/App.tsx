// App router — all routes with auth guards
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import LoginPage from '@/pages/LoginPage';
import OverviewPage from '@/pages/OverviewPage';
import StudentsPage from '@/pages/StudentsPage';
import PlatformsPage from '@/pages/PlatformsPage';
import EvidencePage from '@/pages/EvidencePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import { type ReactNode, useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
  },
});

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
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
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
            <Route path="/login" element={<LoginPage />} />

            {/* Protected */}
            <Route
              path="/"
              element={<ProtectedShell><OverviewPage /></ProtectedShell>}
            />
            <Route
              path="/students"
              element={<ProtectedShell><StudentsPage /></ProtectedShell>}
            />
            <Route
              path="/platforms"
              element={<ProtectedShell><PlatformsPage /></ProtectedShell>}
            />
            <Route
              path="/certifications"
              element={
                <ProtectedShell>
                  <PlaceholderPage title="Certifications" description="Certificate management and verification tracking across all platforms." />
                </ProtectedShell>
              }
            />
            <Route
              path="/evidence"
              element={<ProtectedShell><EvidencePage /></ProtectedShell>}
            />
            <Route
              path="/mentor"
              element={
                <ProtectedShell>
                  <PlaceholderPage title="Mentor Workspace" description="Assigned student overviews, follow-up tracking, and mentor notes." />
                </ProtectedShell>
              }
            />
            <Route
              path="/analytics"
              element={<ProtectedShell><AnalyticsPage /></ProtectedShell>}
            />
            <Route
              path="/integrations"
              element={
                <ProtectedShell>
                  <PlaceholderPage title="Integration Health" description="Platform sync status, job history, and error diagnostics." />
                </ProtectedShell>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedShell>
                  <PlaceholderPage title="Audit Logs" description="Immutable record of all critical operations. HOD access only." />
                </ProtectedShell>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedShell>
                  <PlaceholderPage title="Settings" description="Department configuration, platform management, and user administration." />
                </ProtectedShell>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
