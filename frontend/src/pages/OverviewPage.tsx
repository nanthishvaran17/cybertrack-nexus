// HOD / Admin / Staff dashboard overview
import { useQuery } from '@tanstack/react-query';
import {
  Users, Award, FileCheck, Activity, Globe, TrendingUp,
  AlertCircle, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '@/lib/api';
import type { OverviewMetrics } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';

function StatCard({
  label, value, icon: Icon, color, sub
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  sub?: string;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return <div className="skeleton h-24 w-full rounded-lg" />;
}

const CHART_COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'];

export default function OverviewPage() {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery<OverviewMetrics>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const res = await api.get<OverviewMetrics>('/analytics/overview');
      return res.data;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm">Failed to load analytics. Check your connection.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const syncRate = data.sync_success_rate != null
    ? `${data.sync_success_rate.toFixed(1)}%`
    : '—';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="page-title">
          Welcome, {user?.display_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Department overview — CSE (Cyber Security)
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={data.total_active_students}
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Platform Linked"
          value={data.students_with_linked_platforms}
          icon={Globe}
          color="bg-emerald-500/10 text-emerald-500"
          sub={`of ${data.total_active_students} students`}
        />
        <StatCard
          label="Verified Certificates"
          value={data.verified_certificates}
          icon={Award}
          color="bg-amber-500/10 text-amber-500"
        />
        <StatCard
          label="Pending Evidence"
          value={data.pending_evidence}
          icon={FileCheck}
          color="bg-blue-500/10 text-blue-500"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform adoption chart */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title mb-4">Platform Adoption</h2>
          {data.platform_adoption.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              No platform data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.platform_adoption} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.platform_adoption.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Accessible table alternative */}
          <table className="sr-only">
            <caption>Platform Adoption</caption>
            <thead><tr><th>Platform</th><th>Students</th></tr></thead>
            <tbody>
              {data.platform_adoption.map((p) => (
                <tr key={p.platform}><td>{p.platform}</td><td>{p.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sync & activity card */}
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h2 className="section-title">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" /> Sync success rate
              </span>
              <span className="font-semibold text-emerald-500">{syncRate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Platform coverage
              </span>
              <span className="font-semibold">
                {data.total_active_students > 0
                  ? `${Math.round((data.students_with_linked_platforms / data.total_active_students) * 100)}%`
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Pending reviews
              </span>
              <span className={cn('font-semibold', data.pending_evidence > 0 ? 'text-amber-500' : '')}>
                {data.pending_evidence}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
