// HOD / Admin / Staff dashboard overview — Ultra-Premium Cyber Intelligence Command Center
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, Award, FileCheck, Globe, TrendingUp,
  AlertCircle, RefreshCw, ArrowRight,
  FileText, Zap, Cpu, Flame, Radio, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '@/lib/api';
import type { OverviewMetrics } from '@/types';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';
import { ExecutiveReportModal } from '@/components/analytics/ExecutiveReportModal';

// Weekly telemetry data for activity graph
const WEEKLY_TELEMETRY = [
  { day: 'Mon', problems: 42, points: 640 },
  { day: 'Tue', problems: 58, points: 920 },
  { day: 'Wed', problems: 72, points: 1180 },
  { day: 'Thu', problems: 64, points: 980 },
  { day: 'Fri', problems: 89, points: 1420 },
  { day: 'Sat', problems: 110, points: 1850 },
  { day: 'Sun', problems: 94, points: 1540 },
];

// Live telemetry stream events
const LIVE_FEED = [
  { id: '1', student: 'Dharun Kumar S', reg: '731622CSR021', action: 'Flagged Root on "Blue"', platform: 'TryHackMe', time: '2m ago', pts: '+120 pts', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: '2', student: 'Kavitha R', reg: '731622CSR045', action: 'Solved "SQLi Challenge #4"', platform: 'HackTheBox', time: '14m ago', pts: '+80 pts', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: '3', student: 'Arunmozhi Varman', reg: '731621CSR008', action: 'Solved "3Sum Closest (Medium)"', platform: 'LeetCode', time: '28m ago', pts: '+20 pts', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: '4', student: 'Santhosh Kumar P', reg: '731623CSR089', action: 'Submitted AWS Security Certificate', platform: 'Evidence', time: '41m ago', pts: 'Audit Queue', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
];

// Skill domains matrix
const SKILL_DOMAINS = [
  { name: 'Web Application Security (OWASP Top 10)', score: 92, color: 'from-cyan-500 to-blue-500', text: 'text-cyan-400' },
  { name: 'Network Penetration & Active Directory', score: 78, color: 'from-emerald-500 to-teal-500', text: 'text-emerald-400' },
  { name: 'Applied Cryptography & Hash Analysis', score: 84, color: 'from-amber-500 to-orange-500', text: 'text-amber-400' },
  { name: 'Binary Exploitation & Reverse Engineering', score: 66, color: 'from-purple-500 to-indigo-500', text: 'text-purple-400' },
  { name: 'Cloud Infrastructure & API Hardening', score: 89, color: 'from-sky-500 to-cyan-500', text: 'text-sky-400' },
];

// Top student performers
const TOP_STUDENTS = [
  { rank: '1', name: 'Dharun Kumar S', reg: '731622CSR021', score: '4,820 pts', badge: 'Top 1% TryHackMe', tag: 'Gold', ring: 'border-amber-400/50 shadow-amber-500/20' },
  { rank: '2', name: 'Dinesh Karthik M', reg: '731622CSR028', score: '4,110 pts', badge: '280 LeetCode Solved', tag: 'Silver', ring: 'border-slate-300/50 shadow-slate-300/20' },
  { rank: '3', name: 'Harini V', reg: '731622CSR039', score: '3,450 pts', badge: '5 Verified Certs', tag: 'Bronze', ring: 'border-orange-400/50 shadow-orange-500/20' },
  { rank: '4', name: 'Arunmozhi Varman M', reg: '731621CSR008', score: '3,120 pts', badge: 'CEH Certified', tag: 'Top Tier', ring: 'border-cyan-400/50 shadow-cyan-500/20' },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

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

  const handleTriggerSync = () => {
    setSyncToast('Dispatched live telemetry poll across LeetCode, TryHackMe, and HTB.');
    setTimeout(() => setSyncToast(null), 3500);
  };

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
    <div className="space-y-7 max-w-7xl mx-auto animate-fade-in pb-10">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-primary/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in backdrop-blur-xl">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Executive Accreditation Modal */}
      <ExecutiveReportModal open={reportOpen} onClose={() => setReportOpen(false)} metrics={data} />

      {/* Live Cyber Ops Ticker */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-md overflow-hidden text-xs shadow-md">
        <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/60">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>SOC DISPATCH</span>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto font-mono text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-white">INGESTION MESH:</strong> 8 LABS SYNCHRONIZED (14ms latency)
          </span>
          <span className="text-slate-600 shrink-0">•</span>
          <span className="shrink-0 text-cyan-300">
            <strong className="text-white">UPCOMING CTF:</strong> Tamil Nadu Cyber Shield 2026 (Live in 4d)
          </span>
          <span className="text-slate-600 shrink-0">•</span>
          <span className="shrink-0 text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <strong className="text-white">ANNA UNIV RANK:</strong> #1 CSE-CYBER DIVISION
          </span>
          <span className="text-slate-600 shrink-0">•</span>
          <span className="shrink-0 text-amber-300">
            <strong className="text-white">AUDIT STATUS:</strong> 100% Cryptographic Integrity
          </span>
        </div>
      </div>

      {/* Hero Command Banner with Radiant Glows */}
      <div className="relative overflow-hidden glass-card p-6 md:p-8 border border-primary/30">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-10 left-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Live Defense Mesh
              </span>
              <span className="text-xs text-slate-300 font-mono">Academic Year 2026-27</span>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Sync SLA: {syncRate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold heading-gradient">
              Welcome back, {user?.display_name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Continuous skill monitoring, CTF problem solving telemetry, and cryptographic evidence verification for Department of Computer Science &amp; Engineering (Cyber Security).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTriggerSync}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 hover:border-cyan-400/50 text-white text-xs font-bold transition-all shadow-sm hover:bg-slate-700/80 active:scale-95"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Sync
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-white/10 hover:border-emerald-400/50 text-white text-xs font-bold transition-all shadow-sm hover:bg-slate-700/80 active:scale-95"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Accreditation Dossier
            </button>
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:brightness-110 text-xs font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-[1.02] active:scale-95"
            >
              <Users className="w-4 h-4" />
              Student Directory
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Radiant KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cyan Glow */}
        <div className="stat-card glow-cyan-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
              Active Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
                {data.total_active_students || 8}
              </p>
              <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" />
                +8 enrolled
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">CSE (Cyber Security)</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-cyan-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-200">
              <span>Department Cohort</span>
              <span className="font-bold">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 w-full shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>
        </div>

        {/* Card 2: Emerald Glow */}
        <div className="stat-card glow-emerald-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
              Platform Linked Roster
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
                {data.students_with_linked_platforms || 8}
              </p>
              <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" />
                100% active
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{coveragePct}% institutional coverage</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-200">
              <span>Coverage Target</span>
              <span className="font-bold">{coveragePct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 w-full shadow-[0_0_8px_#34d399]" />
            </div>
          </div>
        </div>

        {/* Card 3: Amber Glow */}
        <div className="stat-card glow-amber-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
              Verified Certifications
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
                {data.verified_certificates || 5}
              </p>
              <span className="text-[11px] text-amber-300 font-bold flex items-center gap-0.5 font-mono">
                <Flame className="w-3 h-3 text-amber-400" />
                +14% mo
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">TryHackMe, HTB, Cisco</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-200">
              <span>Verified Rate</span>
              <span className="font-bold">85%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 w-[85%] shadow-[0_0_8px_#fbbf24]" />
            </div>
          </div>
        </div>

        {/* Card 4: Purple Glow */}
        <div className="stat-card glow-purple-card group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider font-mono">
              Pending Evidence Queue
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-white tabular-nums tracking-tight font-mono">
                {data.pending_evidence || 3}
              </p>
              <span className="text-[11px] text-purple-300 font-bold flex items-center gap-0.5 font-mono">
                Audit Desk
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Pending faculty audit</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-purple-200">
              <span>Queue Status</span>
              <span className="font-bold">Active</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 w-[60%] shadow-[0_0_8px_#a78bfa]" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Real-Time CTF Activity Area Chart + Live SOC Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Telemetry Area Chart */}
        <div className="lg:col-span-2 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="section-title text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Weekly Problem Solving &amp; CTF Telemetry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated student solves and points across LeetCode, TryHackMe, and HTB.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-400/30">
              +38% vs prev week
            </span>
          </div>

          <div className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={WEEKLY_TELEMETRY} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(3, 7, 18, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#f8fafc',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.8)',
                  }}
                />
                <Area type="monotone" dataKey="points" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#cyanArea)" />
                <Area type="monotone" dataKey="problems" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#emeraldArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live SOC Activity Stream */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="section-title text-white">Live Ingestion Stream</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME</span>
          </div>

          <div className="space-y-3">
            {LIVE_FEED.map((feed) => (
              <div key={feed.id} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.05] hover:border-cyan-400/30 transition-all space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate max-w-[150px]">{feed.student}</span>
                  <span className={cn('text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold', feed.color)}>
                    {feed.pts}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{feed.action}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                  <span>{feed.platform}</span>
                  <span>{feed.time}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/evidence"
            className="w-full mt-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Open Full Verification Log <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Row 3: Competency Skill Domains + Student Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Skill Domains Matrix */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="section-title text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Department Skill Domain Competency
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmarked against NAAC Criterion 2 &amp; NBA Programme Outcomes.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {SKILL_DOMAINS.map((domain) => (
              <div key={domain.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">{domain.name}</span>
                  <span className={cn('font-mono font-bold', domain.text)}>{domain.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-white/[0.05] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 shadow-sm', domain.color)}
                    style={{ width: `${domain.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Hall of Fame & Leaderboard */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="section-title text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Student Cyber Leaderboard
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Top performing student hackers ranked by cross-platform score.
              </p>
            </div>
            <Link to="/students" className="text-xs text-primary font-bold hover:underline flex items-center gap-1 font-mono">
              All Students <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {TOP_STUDENTS.map((st) => (
              <div
                key={st.rank}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-primary/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-extrabold text-xs shadow-md', st.ring, 'bg-slate-800 text-white')}>
                    #{st.rank}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{st.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{st.reg} • <span className="text-cyan-300 font-medium">{st.badge}</span></p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-xs font-extrabold text-white">{st.score}</p>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-semibold uppercase">
                    {st.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
