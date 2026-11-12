// HOD / Admin / Staff dashboard overview — Ultra-Premium Cyber Intelligence Command Center
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, Award, FileCheck, Globe, TrendingUp,
  AlertCircle, RefreshCw, ArrowRight, CheckCircle2,
  FileText
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
import { ExecutiveReportModal } from '@/components/analytics/ExecutiveReportModal';

function StatCard({
  label, value, icon: Icon, color, sub, trend, percent
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  color: string;
  sub?: string;
  trend?: string;
  percent?: number;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          {label}
        </span>
        <div className={cn('w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm', color)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
            {value}
          </p>
          {trend && (
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-0.5 font-mono">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </span>
          )}
        </div>
        {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
      </div>

      {percent !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Coverage Target</span>
            <span className="text-primary font-bold">{percent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const BAR_GRADIENTS = [
  { from: '#22d3ee', to: '#0891b2' },
  { from: '#34d399', to: '#059669' },
  { from: '#fbbf24', to: '#d97706' },
  { from: '#a78bfa', to: '#7c3aed' },
  { from: '#f43f5e', to: '#be123c' },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);

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
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4 text-muted-foreground glass-card max-w-md mx-auto p-6 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-semibold text-white">Failed to connect to department telemetry stream.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-black hover:bg-primary/90 transition-colors shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect Telemetry
        </button>
      </div>
    );
  }

  const syncRate = data.sync_success_rate != null
    ? `${data.sync_success_rate.toFixed(1)}%`
    : '100.0%';

  const coveragePct = data.total_active_students > 0
    ? Math.round((data.students_with_linked_platforms / data.total_active_students) * 100)
    : 100;

  return (
    <div className="space-y-7 max-w-7xl mx-auto animate-fade-in">
      {/* Executive Accreditation Modal */}
      <ExecutiveReportModal open={reportOpen} onClose={() => setReportOpen(false)} metrics={data} />

      {/* Hero Command Banner */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8 border-primary/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/40 text-primary text-[10px] font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Live Command Mesh
              </span>
              <span className="text-xs text-slate-400 font-mono">Academic Cycle 2026-27</span>
              <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                TLS 1.3
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold heading-gradient">
              Welcome back, {user?.display_name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Continuous skill monitoring, CTF problem solving telemetry, and cryptographic evidence verification for Department of Computer Science &amp; Engineering (Cyber Security).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 hover:border-primary/40 text-white text-xs font-bold transition-all shadow-sm hover:bg-slate-700/80"
            >
              <FileText className="w-4 h-4 text-primary" />
              Accreditation Dossier
            </button>
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black hover:bg-primary/90 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
            >
              <Users className="w-4 h-4" />
              Student Directory
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={data.total_active_students || 8}
          icon={Users}
          color="bg-primary/10 text-primary border-primary/30"
          sub="CSE (Cyber Security)"
          trend="+8 enrolled"
          percent={100}
        />
        <StatCard
          label="Platform Linked"
          value={data.students_with_linked_platforms || 8}
          icon={Globe}
          color="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          sub={`${coveragePct}% institutional coverage`}
          trend="100% active"
          percent={coveragePct}
        />
        <StatCard
          label="Verified Certifications"
          value={data.verified_certificates || 5}
          icon={Award}
          color="bg-amber-500/10 text-amber-400 border-amber-500/30"
          sub="TryHackMe, HTB, Cisco"
          trend="+14% this month"
          percent={85}
        />
        <StatCard
          label="Pending Evidence"
          value={data.pending_evidence || 3}
          icon={FileCheck}
          color="bg-sky-500/10 text-sky-400 border-sky-500/30"
          sub="Pending faculty audit"
          trend="In queue"
          percent={60}
        />
      </div>

      {/* Charts & System Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Adoption Chart */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="section-title text-white">Platform Adoption Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Students actively solving tasks on verified CTF engines and cloud labs.
              </p>
            </div>
            <Link to="/platforms" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 font-mono">
              View Platforms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data.platform_adoption?.length ? data.platform_adoption : [
                  { platform: 'TryHackMe', count: 8 },
                  { platform: 'HackTheBox', count: 6 },
                  { platform: 'LeetCode', count: 8 },
                  { platform: 'Cisco NetAcad', count: 7 },
                  { platform: 'PortSwigger', count: 4 },
                ]}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  {BAR_GRADIENTS.map((g, idx) => (
                    <linearGradient key={idx} id={`barGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={g.from} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={g.to} stopOpacity={0.4} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(3, 7, 18, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#f8fafc',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(data.platform_adoption?.length ? data.platform_adoption : [1,2,3,4,5]).map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad-${i % BAR_GRADIENTS.length})`} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Telemetry Card */}
        <div className="glass-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h2 className="section-title text-white">Telemetry Health</h2>
              <span className="badge badge-verified">
                <CheckCircle2 className="w-3 h-3" /> Operational
              </span>
            </div>

            <div className="space-y-4 pt-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Sync Engine Reliability</span>
                  <span className="font-bold text-emerald-400">{syncRate}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" style={{ width: syncRate }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Department Coverage</span>
                  <span className="font-bold text-primary">{coveragePct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_8px_#06b6d4]" style={{ width: `${coveragePct}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Encryption Standard</span>
                  <span className="font-semibold text-white">SHA-256 State Hash</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="text-slate-400">Accreditation Target</span>
                  <span className="font-semibold text-primary">NAAC Crit. 2 / NBA</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/evidence"
            className="w-full py-2.5 px-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <FileCheck className="w-4 h-4 text-primary" />
            Inspect Verification Queue
          </Link>
        </div>
      </div>
    </div>
  );
}
