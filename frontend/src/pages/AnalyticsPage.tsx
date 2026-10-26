// Analytics & Reports page
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import type { OverviewMetrics } from '@/types';

const PIE_COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery<OverviewMetrics>({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => (await api.get<OverviewMetrics>('/analytics/overview')).data,
    staleTime: 120_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="skeleton h-8 w-56 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="skeleton h-72 rounded-lg" />
          <div className="skeleton h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8 text-destructive" />
        <p className="text-sm">Failed to load analytics data</p>
        <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  const coverageData = [
    { name: 'Linked', value: data.students_with_linked_platforms },
    { name: 'Not Linked', value: Math.max(0, data.total_active_students - data.students_with_linked_platforms) },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="page-title">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Department-wide learning activity overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform adoption bar chart */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Platform Adoption
          </h2>
          {data.platform_adoption.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
              No platform data yet — link student accounts to see data here.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.platform_adoption} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.platform_adoption.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Accessible alt */}
              <table className="sr-only">
                <caption>Platform Adoption</caption>
                <thead><tr><th>Platform</th><th>Students</th></tr></thead>
                <tbody>
                  {data.platform_adoption.map((p) => (
                    <tr key={p.platform}><td>{p.platform}</td><td>{p.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Platform coverage pie */}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="section-title mb-4">Platform Coverage</h2>
          {data.total_active_students === 0 ? (
            <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">
              No active students in the system
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={coverageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {coverageData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} students`]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Key metrics summary table */}
      <div className="bg-card border border-border rounded-lg p-5">
        <h2 className="section-title mb-4">Summary Metrics</h2>
        <table className="w-full text-sm" aria-label="Summary analytics metrics">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 font-medium text-muted-foreground">Metric</th>
              <th className="pb-2 font-medium text-muted-foreground text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {[
              ['Total Active Students', data.total_active_students],
              ['Students with Linked Platforms', data.students_with_linked_platforms],
              ['Verified Certificates', data.verified_certificates],
              ['Pending Evidence Reviews', data.pending_evidence],
              ['Sync Success Rate', data.sync_success_rate != null ? `${data.sync_success_rate.toFixed(1)}%` : '—'],
            ].map(([label, val]) => (
              <tr key={label as string}>
                <td className="py-2.5 text-muted-foreground">{label as string}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{val as string | number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
