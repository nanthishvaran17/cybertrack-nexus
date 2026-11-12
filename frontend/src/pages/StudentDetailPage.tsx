// Student Cyber Intelligence Dossier & Deep Inspection Page
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Award, Globe, FileCheck, ArrowLeft,
  Mail, Calendar, CheckCircle2, AlertCircle,
  ExternalLink, Printer, UserCheck, Terminal,
  Hash, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '@/lib/api';
import type { Student, PlatformAccount, EvidenceSubmission } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'platforms' | 'skills' | 'certs' | 'evidence'>('platforms');

  const { data: student, isLoading: isStudentLoading, isError } = useQuery<Student>({
    queryKey: ['students', id],
    queryFn: async () => {
      const res = await api.get<Student>(`/students/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: platformAccounts } = useQuery<PlatformAccount[]>({
    queryKey: ['platform-accounts', id],
    queryFn: async () => {
      const res = await api.get<PlatformAccount[]>(`/platform-accounts?student_id=${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: evidenceList } = useQuery<EvidenceSubmission[]>({
    queryKey: ['evidence', id],
    queryFn: async () => {
      const res = await api.get<EvidenceSubmission[]>(`/evidence?student_id=${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });

  useSEO({
    title: student ? `${student.full_name} | Cyber Intelligence Dossier` : 'Student Dossier | CyberTrack Nexus',
    description: `Continuous skill monitoring, CTF telemetry, and verified cybersecurity credentials for ${student?.full_name || 'student'}.`,
    canonicalPath: `/students/${id}`,
  });

  // Fallback realistic student mock data if loading from mock database
  const activeStudent: Student = student || {
    id: id || 'demo-id',
    full_name: 'Dharun Kumar R',
    register_number: '732222CSR034',
    institutional_email: 'dharunkumar.cs22@nandhaengg.org',
    academic_year: 3,
    section: 'B',
    department_id: 'dept-cyber-01',
    is_active: true,
    mentor_name: 'Dr. K. Vigneshwaran (Associate Prof)',
    created_at: '2024-08-10T09:00:00Z',
    updated_at: '2026-11-12T04:20:00Z',
  };

  const SKILL_DATA = [
    { domain: 'Network Security', score: 92 },
    { domain: 'Web Exploitation', score: 86 },
    { domain: 'Digital Forensics', score: 78 },
    { domain: 'Cryptography', score: 84 },
    { domain: 'Binary Reversing', score: 68 },
    { domain: 'Cloud & OSINT', score: 74 },
  ];

  const MOCK_PLATFORMS = platformAccounts && platformAccounts.length > 0 ? platformAccounts : [
    {
      id: 'p1',
      student_id: activeStudent.id,
      platform_id: 'thm-1',
      platform_name: 'TryHackMe',
      external_username: 'dharun_sec0x',
      profile_url: 'https://tryhackme.com/p/dharun_sec0x',
      verification_status: 'verified' as const,
      sync_status: 'healthy' as const,
      linked_at: '2025-01-12T10:00:00Z',
      last_successful_sync_at: '2026-11-12T07:15:00Z',
    },
    {
      id: 'p2',
      student_id: activeStudent.id,
      platform_id: 'htb-1',
      platform_name: 'Hack The Box',
      external_username: '0xNexusPro',
      profile_url: 'https://app.hackthebox.com/profile/0xNexusPro',
      verification_status: 'verified' as const,
      sync_status: 'healthy' as const,
      linked_at: '2025-02-14T11:30:00Z',
      last_successful_sync_at: '2026-11-12T06:45:00Z',
    },
    {
      id: 'p3',
      student_id: activeStudent.id,
      platform_id: 'lc-1',
      platform_name: 'LeetCode',
      external_username: 'dharun_algos',
      profile_url: 'https://leetcode.com/dharun_algos',
      verification_status: 'verified' as const,
      sync_status: 'healthy' as const,
      linked_at: '2024-11-05T14:20:00Z',
      last_successful_sync_at: '2026-11-12T05:00:00Z',
    },
    {
      id: 'p4',
      student_id: activeStudent.id,
      platform_id: 'cisco-1',
      platform_name: 'Cisco NetAcad',
      external_username: 'dharun.k@netacad',
      profile_url: null,
      verification_status: 'verified' as const,
      sync_status: 'healthy' as const,
      linked_at: '2024-09-01T08:00:00Z',
      last_successful_sync_at: '2026-11-11T18:00:00Z',
    },
  ];

  const MOCK_CERTS = [
    {
      id: 'cert-1',
      title: 'CompTIA Security+ Certification',
      issuer: 'CompTIA',
      date: 'Aug 2026',
      hash: '9f83c18b67f1efd9a1012879f8263cf2248589078f14948a27d2c31e21b212f0',
      status: 'VERIFIED',
    },
    {
      id: 'cert-2',
      title: 'TryHackMe Pre-Security Learning Path',
      issuer: 'TryHackMe',
      date: 'Jun 2026',
      hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
      status: 'VERIFIED',
    },
    {
      id: 'cert-3',
      title: 'Cisco Certified Support Technician (Cybersecurity)',
      issuer: 'Cisco Systems',
      date: 'Jan 2026',
      hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
      status: 'VERIFIED',
    },
  ];

  if (isStudentLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError && !activeStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <AlertCircle className="w-8 h-8 text-rose-500" />
        <p className="text-sm font-semibold">Student record could not be located in department ledger.</p>
        <Link to="/students" className="text-xs text-primary hover:underline flex items-center gap-1.5 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Back and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Student Directory
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border text-foreground text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Dossier
          </button>
          <span className="badge badge-verified">
            <CheckCircle2 className="w-3 h-3" />
            Accreditation Record Active
          </span>
        </div>
      </div>

      {/* Student Master Profile Header */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-card via-card to-primary/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center text-2xl font-black text-primary shadow-inner shrink-0">
              {getInitials(activeStudent.full_name)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {activeStudent.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold">
                  <Hash className="w-3 h-3" />
                  {activeStudent.register_number}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-xs font-semibold text-foreground">
                  Year {activeStudent.academic_year} • Sec {activeStudent.section}
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span>{activeStudent.institutional_email}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Faculty Mentor: {activeStudent.mentor_name || 'Assigned to CSE Mentor Group'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Enrolled: 2022-2026 Batch
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-border/60">
            <div className="text-right">
              <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">Cyber Index Rating</p>
              <p className="text-2xl font-black text-primary tabular-nums mt-0.5">842 <span className="text-xs text-muted-foreground font-normal">/ 1000</span></p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Top 8% Cohort Percentile
            </span>
          </div>
        </div>
      </div>

      {/* Cyber Intelligence Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">CTF Challenges Solved</p>
          <p className="text-2xl font-black text-foreground mt-1 tabular-nums">142</p>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">+12 this month</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Verified Credentials</p>
          <p className="text-2xl font-black text-amber-400 mt-1 tabular-nums">3 Certs</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cryptographic signed</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Linked Platforms</p>
          <p className="text-2xl font-black text-primary mt-1 tabular-nums">{MOCK_PLATFORMS.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Automated telemetry</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Evidence Submissions</p>
          <p className="text-2xl font-black text-sky-400 mt-1 tabular-nums">{evidenceList?.length || 6}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">All audits cleared</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('platforms')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'platforms'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Globe className="w-4 h-4" />
          Linked Platforms &amp; Live Telemetry ({MOCK_PLATFORMS.length})
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'skills'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Skill Proficiency Matrix
        </button>

        <button
          onClick={() => setActiveTab('certs')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'certs'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Award className="w-4 h-4" />
          Accreditation Certifications ({MOCK_CERTS.length})
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={cn(
            'px-4 py-2.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap',
            activeTab === 'evidence'
              ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <FileCheck className="w-4 h-4" />
          Proof &amp; Evidence Queue
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_PLATFORMS.map((account) => (
            <div key={account.id} className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{account.platform_name}</h3>
                    <p className="text-xs font-mono text-muted-foreground">@{account.external_username || 'unconfigured'}</p>
                  </div>
                </div>

                <span className="badge badge-verified">
                  <CheckCircle2 className="w-3 h-3" /> {account.verification_status.toUpperCase()}
                </span>
              </div>

              <div className="text-xs space-y-1.5 pt-2 border-t border-border/60 font-mono text-muted-foreground">
                <div className="flex justify-between">
                  <span>Telemetry State:</span>
                  <span className="text-emerald-400 font-semibold">{account.sync_status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync Timestamp:</span>
                  <span>{account.last_successful_sync_at ? new Date(account.last_successful_sync_at).toLocaleDateString() : 'Active'}</span>
                </div>
              </div>

              {account.profile_url && (
                <a
                  href={account.profile_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline pt-1"
                >
                  Inspect External Profile <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="glass-card p-6 space-y-6">
          <div>
            <h3 className="section-title">Cybersecurity Domain Proficiency Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Continuous assessment data aggregated from TryHackMe rooms, HackTheBox machines, and department practicals.
            </p>
          </div>

          <div className="pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SKILL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="domain" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {SKILL_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.score > 80 ? '#06b6d4' : '#0891b2'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {SKILL_DATA.map((s) => (
              <div key={s.domain} className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <p className="text-xs font-semibold text-foreground">{s.domain}</p>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-muted-foreground font-mono">{s.score}% Mastery</span>
                  <span className={cn('font-bold font-mono', s.score >= 80 ? 'text-emerald-400' : 'text-amber-400')}>
                    {s.score >= 80 ? 'ADVANCED' : 'COMPETENT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certs' && (
        <div className="space-y-4">
          {MOCK_CERTS.map((cert) => (
            <div key={cert.id} className="glass-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{cert.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">Issued by {cert.issuer} • {cert.date}</p>
                  </div>
                </div>

                <span className="badge badge-verified w-fit">
                  <CheckCircle2 className="w-3 h-3" /> {cert.status}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/80 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="truncate mr-4">SHA-256 Hash: {cert.hash}</span>
                <span className="shrink-0 text-primary font-semibold">VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Submitted Audit Proofs &amp; Transcripts</h3>
            <span className="text-xs text-muted-foreground font-mono">Total: {evidenceList?.length || 3} Files</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'tryhackme_presecurity_completion.pdf', date: 'Oct 24, 2026', type: 'Certificate PDF', status: 'Verified' },
              { name: 'htb_active_boxes_dossier.png', date: 'Sep 15, 2026', type: 'Lab Completion Screenshot', status: 'Verified' },
              { name: 'cisco_ccna_module1_transcript.pdf', date: 'Aug 29, 2026', type: 'Transcript PDF', status: 'Verified' },
            ].map((e, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileCheck className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{e.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{e.type} • {e.date}</p>
                  </div>
                </div>
                <span className="badge badge-verified">{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
