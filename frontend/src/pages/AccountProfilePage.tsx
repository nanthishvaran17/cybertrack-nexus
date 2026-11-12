// User Account Profile & Security Clearance Dossier
import { useState } from 'react';
import {
  Shield, Key, User, CheckCircle2, Lock, Smartphone,
  Activity, Clock, Globe, Copy, Check, RefreshCw,
  Bell, FileCheck, Award, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn, getInitials } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [auditAlerts, setAuditAlerts] = useState(true);
  const [telemetrySync, setTelemetrySync] = useState(true);

  useSEO({
    title: 'Officer Profile & Security Credentials',
    description: 'Institutional security clearance, active sessions, cryptographic keys, and department audit performance stats.',
    canonicalPath: '/profile',
  });

  const MOCK_API_KEY = 'ctn_live_sec_99a8b7c6d5e4f3a2b1c09876543210fe';

  const copyApiKey = () => {
    navigator.clipboard.writeText(MOCK_API_KEY);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const rolesDisplay = user?.roles.map((r) => r.toUpperCase()).join(' • ') || 'FACULTY';

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Officer Clearance Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-r from-card via-card to-primary/5 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center text-2xl font-black text-primary shadow-inner">
                {getInitials(user?.display_name || 'Cyber Officer')}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px] text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-foreground tracking-tight">
                  {user?.display_name || 'Academic Security Officer'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-[11px] font-mono font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  Clearance: {rolesDisplay}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className="text-primary font-semibold">Faculty Badge: NEC-CSE-CYBER-001</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Department of Computer Science &amp; Engineering (Cyber Security) • Nandha Engineering College (Autonomous)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-card/80 border border-border/80 text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Authentication Status</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end mt-0.5">
                <Lock className="w-3.5 h-3.5" />
                Hardware 2FA Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Account Performance & Audit Stats */}
      <div className="space-y-3">
        <h2 className="section-title flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Officer Governance &amp; Verification Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Evidence Reviewed</p>
                <p className="text-3xl font-black text-foreground mt-1 tabular-nums">48</p>
                <p className="text-xs text-emerald-500 font-medium mt-1">100% SLA Adherence</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Audits Conducted</p>
                <p className="text-3xl font-black text-foreground mt-1 tabular-nums">114</p>
                <p className="text-xs text-muted-foreground mt-1">Immutable Logged</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Average Latency</p>
                <p className="text-3xl font-black text-foreground mt-1 tabular-nums">3.8h</p>
                <p className="text-xs text-muted-foreground mt-1">Queue clearance speed</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Compliance Rating</p>
                <p className="text-3xl font-black text-primary mt-1 tabular-nums">99.8%</p>
                <p className="text-xs text-primary/80 mt-1">NAAC / NBA Audit-ready</p>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Sessions & API Credentials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Security Sessions */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Active Institutional Sessions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Current authenticated hardware and IP endpoints accessing this account.
              </p>
            </div>
            <span className="badge badge-verified">
              <CheckCircle2 className="w-3 h-3" /> 2 Active
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Current Workstation (This Device)</p>
                    <p className="text-[11px] text-muted-foreground font-mono">Windows 11 • Chrome 130.0 / Nexus UI</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CURRENT
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                <span>IP: 192.168.1.104 (Campus Intranet)</span>
                <span>Active now</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Mobile Faculty Portal</p>
                    <p className="text-[11px] text-muted-foreground font-mono">iOS 18.1 • Mobile Safari</p>
                  </div>
                </div>
                <button className="text-[10px] text-rose-400 hover:underline font-mono">
                  Revoke
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                <span>IP: 103.24.18.2 (Erode, IN)</span>
                <span>42 mins ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Developer API & Scraper Token Access */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              Officer API Token (Nexus Integration)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bearer token for programmatic telemetry ingestion, automated scraping bots, and CLI scripts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Service Token (Production)</span>
              <span className="text-[10px] font-mono text-muted-foreground">Expires: 30 days</span>
            </div>

            <div className="relative flex items-center">
              <input
                type={showApiKey ? 'text' : 'password'}
                readOnly
                value={MOCK_API_KEY}
                className="w-full pl-3 pr-20 py-2 bg-background border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                  title={showApiKey ? 'Hide token' : 'Show token'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={copyApiKey}
                  className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                  title="Copy token"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Never share this credential in public repositories. Authenticated calls carry full administrative privileges for Department of CSE (Cyber Security).
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hash Algorithm: HMAC-SHA256</span>
            <button
              onClick={() => alert('Token regenerated and signed.')}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rotate Token
            </button>
          </div>
        </div>
      </div>

      {/* Notification and Governance Preferences */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="section-title flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Governance &amp; Alert Notifications
        </h3>

        <div className="divide-y divide-border/60">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Critical Evidence Verification Alerts</p>
              <p className="text-[11px] text-muted-foreground">Receive instant desktop &amp; push notification when a student submits new certificates.</p>
            </div>
            <button
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative',
                emailAlerts ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                  emailAlerts ? 'right-1' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Accreditation Weekly Rollup Digest</p>
              <p className="text-[11px] text-muted-foreground">Weekly PDF summary delivered for NAAC/NBA criteria documentation.</p>
            </div>
            <button
              onClick={() => setAuditAlerts(!auditAlerts)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative',
                auditAlerts ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                  auditAlerts ? 'right-1' : 'left-1'
                )}
              />
            </button>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Automated Telemetry Sync Status</p>
              <p className="text-[11px] text-muted-foreground">Alert when TryHackMe, HackTheBox, or LeetCode rate limit triggers.</p>
            </div>
            <button
              onClick={() => setTelemetrySync(!telemetrySync)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors relative',
                telemetrySync ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                  telemetrySync ? 'right-1' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
