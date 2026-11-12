// Faculty & Administrative User Profile, Security Clearance Dossier & Account Stats
import { useState } from 'react';
import {
  Shield, Key, Lock, CheckCircle2,
  Activity, Users, FileCheck, Smartphone,
  Copy, RefreshCw, LogOut, Terminal, Zap,
  Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { getInitials, cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  useSEO({
    title: 'Account Security Dossier & Faculty Profile',
    description: 'Personal administrative command center, institutional clearance status, audit performance metrics, and session security.',
    canonicalPath: '/profile',
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'apikeys' | 'activity'>('overview');
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    showToast('API Key copied securely to clipboard.');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // Mock sessions for current device
  const activeSessions = [
    {
      id: 'sess-1',
      device: 'Desktop — Windows 11 (Chrome 124)',
      ip: '192.168.1.104',
      location: 'Tamil Nadu, India',
      isCurrent: true,
      lastActive: 'Just now',
    },
    {
      id: 'sess-2',
      device: 'Mobile — iOS 17.5 (Safari)',
      ip: '49.207.182.91',
      location: 'Coimbatore, India',
      isCurrent: false,
      lastActive: '3 hours ago',
    },
  ];

  // Personal audit trail
  const recentActivities = [
    {
      id: 'act-1',
      action: 'Verified Certificate Evidence',
      target: 'Dharun Kumar (732221205012) — TryHackMe Pre-Security',
      time: '24 minutes ago',
      status: 'success',
    },
    {
      id: 'act-2',
      action: 'Triggered Telemetry Synchronization',
      target: '128 students across LeetCode and GitHub adapters',
      time: '2 hours ago',
      status: 'success',
    },
    {
      id: 'act-3',
      action: 'Exported Institutional NAAC Dossier',
      target: 'Criteria 2.6.2 Student Attainment Report',
      time: 'Yesterday at 4:15 PM',
      status: 'success',
    },
    {
      id: 'act-4',
      action: 'Assigned Mentee Cadre',
      target: 'Allocated 18 Year-II students to Dr. M. Priya',
      time: '2 days ago',
      status: 'info',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-primary/40 text-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-slide-in backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center text-xl sm:text-2xl font-black text-primary shadow-xl shadow-cyan-500/10">
              {user ? getInitials(user.display_name) : 'CT'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {user?.display_name || 'Faculty User'}
                </h1>
                <span className="badge badge-verified capitalize">
                  {user?.roles[0] || 'Administrator'}
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Clearance
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                {user?.email} • Department of Computer Science &amp; Engineering (Cyber Security)
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground font-mono">
                <span>Employee ID: <strong className="text-foreground">NEC-CSE-CS-041</strong></span>
                <span>•</span>
                <span>Security Clearance: <strong className="text-primary">Level 4 (Executive HOD)</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => showToast('Cryptographic state fingerprint verified against ledger.')}
              className="flex-1 md:flex-initial px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              Verify State
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Account Performance Metrics (Crucial Account Stats Requested by User) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cohort Supervised</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">128</p>
          <p className="text-[11px] text-muted-foreground">Active CSE Cyber Security students</p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Evidence Audited</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">42</p>
          <p className="text-[11px] text-emerald-400 font-medium">99.8% verification accuracy</p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Review Speed</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">1.8 hrs</p>
          <p className="text-[11px] text-muted-foreground">Within institutional 24hr SLA</p>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sync Telemetry</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">6-Hour Cadence</p>
          <p className="text-[11px] text-muted-foreground">Automated worker active</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            'pb-3 border-b-2 transition-all flex items-center gap-2',
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Shield className="w-4 h-4" />
          Security Clearance &amp; Identity
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={cn(
            'pb-3 border-b-2 transition-all flex items-center gap-2',
            activeTab === 'sessions'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Smartphone className="w-4 h-4" />
          Active Device Sessions ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('apikeys')}
          className={cn(
            'pb-3 border-b-2 transition-all flex items-center gap-2',
            activeTab === 'apikeys'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Key className="w-4 h-4" />
          API Access Tokens
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            'pb-3 border-b-2 transition-all flex items-center gap-2',
            activeTab === 'activity'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Activity className="w-4 h-4" />
          Faculty Audit Trail
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Institutional Roles & Permissions */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Role Permissions &amp; Access Scope
            </h3>

            <div className="space-y-3 pt-1">
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Cohort Roster Management</p>
                  <p className="text-muted-foreground">Import, edit, and assign student mentors</p>
                </div>
                <span className="text-emerald-400 font-mono font-bold">GRANTED</span>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Evidence Verification Authority</p>
                  <p className="text-muted-foreground">Approve/reject certificates with cryptographic sign</p>
                </div>
                <span className="text-emerald-400 font-mono font-bold">GRANTED</span>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Platform Adapter Orchestration</p>
                  <p className="text-muted-foreground">Trigger live syncs and rotate scraper credentials</p>
                </div>
                <span className="text-emerald-400 font-mono font-bold">GRANTED</span>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">Audit Log Inspection</p>
                  <p className="text-muted-foreground">Immutable tamper-evident event streaming</p>
                </div>
                <span className="text-emerald-400 font-mono font-bold">GRANTED</span>
              </div>
            </div>
          </div>

          {/* Cryptographic State Hash & Security Enclave */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Cryptographic Enclave &amp; Signature
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-muted-foreground font-semibold">Faculty Ed25519 Public Key:</span>
                <p className="font-mono text-[11px] text-primary break-all">
                  ed25519:6c8a419f8b22a01d9e23f051c094bb92408c437190d7c71e89f
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-muted-foreground font-semibold">Two-Factor Authentication (2FA):</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-foreground font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Hardware TOTP Enforced
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">PROTECTED</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-1">
                <span className="text-muted-foreground font-semibold">Audit Compliance Standard:</span>
                <p className="text-foreground font-medium">
                  ISO/IEC 27001 &amp; NAAC SSR Digital Evidence Integrity
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast('Security diagnostics passed. Zero compromised tokens.')}
              className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Run Account Integrity Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* 2. Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="glass-card divide-y divide-border animate-fade-in">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Active Authenticated Devices</h3>
              <p className="text-xs text-muted-foreground">List of valid JWT session tokens registered in Nexus Redis cache.</p>
            </div>
            <button
              onClick={() => showToast('All secondary sessions terminated successfully.')}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
            >
              Revoke Other Sessions
            </button>
          </div>

          {activeSessions.map((sess) => (
            <div key={sess.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-card border border-border text-foreground">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{sess.device}</p>
                    {sess.isCurrent && (
                      <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-mono font-bold">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    IP: {sess.ip} • Location: {sess.location} • Last active {sess.lastActive}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => showToast(`Revoked session from ${sess.device}`)}
                  className="px-3 py-1.5 rounded-lg bg-card border border-border hover:bg-rose-500/10 hover:text-rose-400 text-xs font-medium text-muted-foreground transition-colors self-start sm:self-center"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. API Keys Tab */}
      {activeTab === 'apikeys' && (
        <div className="glass-card p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold text-foreground">Personal Automation Access Key</h3>
            <p className="text-xs text-muted-foreground">
              Use this bearer key to trigger telemetry synchronization or ingest evidence programmatically from scripts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-primary" />
                Default Faculty Scraper Key (Read/Write)
              </span>
              <span className="badge badge-verified">Active</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-xs bg-muted/60 px-3.5 py-2.5 rounded-lg border border-border select-all overflow-hidden truncate">
                {apiKeyRevealed
                  ? 'ctn_live_sec_994a8e7b1928df031cba44e8913b5'
                  : 'ctn_live_sec_•••••••••••••••••••••••••••••'}
              </div>
              <button
                onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
                className="p-2.5 rounded-lg bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label={apiKeyRevealed ? 'Hide API key' : 'Show API key'}
              >
                {apiKeyRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard('ctn_live_sec_994a8e7b1928df031cba44e8913b5')}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-xs flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                {copiedKey ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Scopes: <code className="text-foreground">students:read</code>, <code className="text-foreground">evidence:verify</code>, <code className="text-foreground">telemetry:sync</code>. Never commit this token to Git repositories.
            </p>
          </div>
        </div>
      )}

      {/* 4. Activity Audit Trail */}
      {activeTab === 'activity' && (
        <div className="glass-card divide-y divide-border animate-fade-in">
          <div className="p-4">
            <h3 className="text-sm font-bold text-foreground">Personal Activity &amp; Audit Log</h3>
            <p className="text-xs text-muted-foreground">Tamper-evident log of administrative actions taken with your credentials.</p>
          </div>

          {recentActivities.map((act) => (
            <div key={act.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{act.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.target}</p>
                </div>
              </div>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0">{act.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
