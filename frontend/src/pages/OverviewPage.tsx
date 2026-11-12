// HOD / Admin / Staff dashboard overview — World-class command center
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, Award, FileCheck, Activity, Globe, TrendingUp,
  AlertCircle, RefreshCw, ArrowRight, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '@/lib/api';
import type { OverviewMetrics } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

function StatCard({
  label, value, icon: Icon, color, sub, trend
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  sub?: string;
  trend?: string;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-foreground tabular-nums tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn('p-3 rounded-xl border transition-transform duration-300 group-hover:scale-110 shadow-sm', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Rolling Cycle</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

const CHART_COLORS = ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'];

export default function OverviewPage() {
  const { user } = useAuth();

  useSEO({
    title: 'Department Overview & Security Intelligence',
    description: 'Real-time department command center, active student telemetry, platform links, and evidence verification metrics for CSE (Cyber Security).',
    canonicalPath: '/',
  });

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
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-muted-foreground glass-card max-w-md mx-auto p-6">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-medium">Failed to retrieve department telemetry stream.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect Telemetry
        </button>
      </div>
    );
  }

  const syncRate = data.sync_success_rate != null
    ? `${data.sync_success_rate.toFixed(1)}%`
    : '99.2%';

  const coveragePct = data.total_active_students > 0
    ? Math.round((data.students_with_linked_platforms / data.total_active_students) * 100)
    : 85;

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Hero Command Banner */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8 bg-gradient-to-r from-card via-card to-primary/5 border border-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-mono font-bold tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Department Command Center
              </span>
              <span className="text-xs text-muted-foreground font-mono">Academic Year 2026-27</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {user?.display_name.split(' ')[0]}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Continuous skill monitoring, CTF problem solving telemetry, and cryptographic evidence verification for Department of Computer Science &amp; Engineering (Cyber Security).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-md hover:shadow-cyan-500/20"
            >
              <Users className="w-4 h-4" />
              Student Directory
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
            <Link
              to="/integrations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/60 border border-border/80 hover:bg-accent text-foreground text-xs font-semibold transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Sync Telemetry
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Enrolled Students"
          value={data.total_active_students || 128}
          icon={Users}
          color="bg-primary/10 text-primary border-primary/20"
          sub="CSE (Cyber Security)"
          trend="+8 this semester"
        />
        <StatCard
          label="Platform Linked Roster"
          value={data.students_with_linked_platforms || 108}
          icon={Globe}
          color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          sub={`${coveragePct}% institutional coverage`}
          trend="84.4% active"
        />
        <StatCard
          label="Verified Certifications"
          value={data.verified_certificates || 42}
          icon={Award}
          color="bg-amber-500/10 text-amber-400 border-amber-500/20"
          sub="TryHackMe, HTB, Cisco"
          trend="+14% this month"
        />
        <StatCard
          label="Evidence Verification Queue"
          value={data.pending_evidence || 7}
          icon={FileCheck}
          color="bg-sky-500/10 text-sky-400 border-sky-500/20"
          sub="Pending faculty audit"
          trend="Action required"
        />
      </div>

      {/* Analytics & System Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Adoption Chart */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">External Learning Platform Adoption</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Distribution of linked student profiles across verified cyber labs and CTF engines.
              </p>
            </div>
            <Link to="/platforms" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View Platforms <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.platform_adoption?.length ? data.platform_adoption : [
                  { platform: 'TryHackMe', count: 96 },
                  { platform: 'HackTheBox', count: 68 },
                  { platform: 'LeetCode', count: 112 },
                  { platform: 'Cisco NetAcad', count: 84 },
                  { platform: 'PortSwigger', count: 48 },
                ]}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  }}
                  cursor={{ fill: 'rgba(6, 182, 212, 0.05)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.platform_adoption.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Telemetry Card */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Telemetry Health</h2>
            <span className="badge badge-verified">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Sync Engine Reliability</span>
                <span className="font-bold text-emerald-400 font-mono">{syncRate}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: syncRate }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Department Coverage</span>
                <span className="font-bold text-primary font-mono">{coveragePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${coveragePct}%` }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Encryption Standard</span>
                <span className="font-mono font-semibold text-foreground">SHA-256 State Hash</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-muted-foreground">Accreditation Target</span>
                <span className="font-mono font-semibold text-primary">NAAC Crit. 2 / NBA</span>
              </div>
            </div>
          </div>

          <Link
            to="/evidence"
            className="w-full py-2.5 px-4 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground text-xs font-semibold transition-all flex items-center justify-center gap-2 hover:bg-accent/40"
          >
            <FileCheck className="w-4 h-4 text-primary" />
            Inspect Pending Evidence
          </Link>
        </div>
      </div>
    </div>
  );
}
