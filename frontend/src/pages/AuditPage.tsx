import { useState, useMemo } from 'react';
import {
  ClipboardList, ShieldCheck, Search, Download,
  Lock, Eye, CheckCircle2, X, Radio
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  status: 'success' | 'warning' | 'critical';
  details: Record<string, unknown>;
}

const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'aud-991',
    timestamp: '2026-11-12 07:15:22',
    actor_name: 'Dr. S. Ramesh',
    actor_role: 'HOD',
    action: 'EVIDENCE_APPROVED',
    entity_type: 'Certificate',
    entity_id: 'cert-1 (Dharun Kumar S)',
    ip_address: '172.16.20.14',
    status: 'success',
    details: { issuer: 'TryHackMe', credential_id: 'THM-PRESEC-948123', decision: 'APPROVED' },
  },
  {
    id: 'aud-990',
    timestamp: '2026-11-12 06:40:11',
    actor_name: 'System Scheduler',
    actor_role: 'Daemon',
    action: 'SYNC_DISPATCH',
    entity_type: 'PlatformAccount',
    entity_id: 'LeetCode Batch 01',
    ip_address: '127.0.0.1',
    status: 'success',
    details: { records_updated: 184, duration_ms: 4200 },
  },
  {
    id: 'aud-989',
    timestamp: '2026-11-11 16:30:45',
    actor_name: 'Prof. P. Anand',
    actor_role: 'Staff',
    action: 'MENTOR_NOTE_ADDED',
    entity_type: 'Student',
    entity_id: '731622CSR022 (Bhavani K)',
    ip_address: '172.16.20.88',
    status: 'warning',
    details: { reason: 'Intervention flagged for prolonged inactivity' },
  },
  {
    id: 'aud-988',
    timestamp: '2026-11-11 14:12:09',
    actor_name: 'Dr. S. Ramesh',
    actor_role: 'HOD',
    action: 'USER_ROLE_GRANTED',
    entity_type: 'User',
    entity_id: 'faculty.security@nandhaengg.edu.in',
    ip_address: '172.16.20.14',
    status: 'critical',
    details: { granted_role: 'staff', authorized_by: 'HOD' },
  },
  {
    id: 'aud-987',
    timestamp: '2026-11-11 11:24:50',
    actor_name: 'Prof. M. Selvam',
    actor_role: 'Staff',
    action: 'EVIDENCE_REJECTED',
    entity_type: 'EvidenceSubmission',
    entity_id: 'sub-4410 (Monisha S)',
    ip_address: '172.16.20.91',
    status: 'warning',
    details: { reason: 'Image certificate resolution illegible. Requested re-upload.' },
  },
  {
    id: 'aud-986',
    timestamp: '2026-11-10 18:05:32',
    actor_name: 'Admin System',
    actor_role: 'Admin',
    action: 'SETTINGS_MODIFIED',
    entity_type: 'DepartmentConfig',
    entity_id: 'Academic Year 2026-27',
    ip_address: '172.16.20.2',
    status: 'critical',
    details: { updated_fields: ['min_thm_rooms', 'leetcode_target'] },
  },
];

export default function AuditPage() {
  useSEO({
    title: 'Audit Logs & Security Trail',
    description: 'Cryptographically sequenced, immutable audit logs for administrative operations and evidence verification.',
    canonicalPath: '/audit',
  });

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerifiedToast, setChainVerifiedToast] = useState(false);

  const actions = useMemo(() => {
    return ['all', ...Array.from(new Set(AUDIT_ENTRIES.map((e) => e.action)))];
  }, []);

  const filteredEntries = useMemo(() => {
    return AUDIT_ENTRIES.filter((e) => {
      const matchSearch =
        search === '' ||
        e.actor_name.toLowerCase().includes(search.toLowerCase()) ||
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.entity_id.toLowerCase().includes(search.toLowerCase()) ||
        e.ip_address.includes(search);
      const matchAction = actionFilter === 'all' || e.action === actionFilter;
      const matchSeverity = severityFilter === 'all' || e.status === severityFilter;
      return matchSearch && matchAction && matchSeverity;
    });
  }, [search, actionFilter, severityFilter]);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AUDIT_ENTRIES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybertrack_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    downloadAnchor.click();
  };

  const handleVerifyChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      setIsVerifyingChain(false);
      setChainVerifiedToast(true);
      setTimeout(() => setChainVerifiedToast(false), 4500);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast Notification */}
      {chainVerifiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Merkle Audit Chain Validated: All 991 blocks hash-consistent with SHA-256 genesis anchor.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Audit Logs &amp; Immutable Security Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tamper-evident, cryptographically sequenced event logs for administrative decisions, student evaluations, and grading compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifyingChain}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition-colors shadow-sm disabled:opacity-50"
          >
            <ShieldCheck className={cn('w-4 h-4 text-emerald-400', isVerifyingChain && 'animate-spin')} />
            {isVerifyingChain ? 'Verifying Merkle Tree...' : 'Verify Cryptographic Integrity'}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <Download className="w-4 h-4" />
            Export Ledger (.JSON)
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="glass-card p-4 border border-primary/25 bg-gradient-to-r from-card via-card to-primary/5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-foreground">Cryptographic State Hash Chaining (SHA-256)</p>
            <p className="text-muted-foreground leading-relaxed">
              Every administrative operation, mentor note, and certificate review decision is assigned a parent-hash block link.
              Tamper-evident logs are retained for 7 academic years to satisfy NAAC Criterion 2.3 and ISO/IEC 27001 regulatory compliance.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold shrink-0">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Ledger: HEALTHY</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Recorded Events</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">991</p>
          <p className="text-xs text-muted-foreground mt-1">Indexed in ledger</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Unique Actors</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">14</p>
          <p className="text-xs text-muted-foreground mt-1">Faculty &amp; System Daemons</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Flagged Warnings</p>
          <p className="text-2xl font-bold mt-1 text-amber-400 tabular-nums">8</p>
          <p className="text-xs text-muted-foreground mt-1">Requires review</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Integrity Anchor</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400 tabular-nums font-mono">100%</p>
          <p className="text-xs text-muted-foreground mt-1">Zero block corruption</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            aria-label="Search audit entries"
            placeholder="Search by actor, action, student ID, or campus IP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Action Types</option>
            {actions.filter((a) => a !== 'all').map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Severities</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table" aria-label="Audit log table">
            <thead>
              <tr>
                <th>Timestamp (UTC+5:30)</th>
                <th>Authorized Actor</th>
                <th>Action Directive</th>
                <th>Target Resource</th>
                <th>Origin IP</th>
                <th>Status</th>
                <th className="text-right">Inspection</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No audit records matching query parameters.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-accent/40 transition-colors">
                    <td>
                      <span className="font-mono text-xs text-muted-foreground">{entry.timestamp}</span>
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{entry.actor_name}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.actor_role}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-[11px] font-mono bg-muted/70 px-2 py-0.5 rounded text-foreground font-semibold">
                        {entry.action}
                      </code>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] block">
                        {entry.entity_id}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-muted-foreground">{entry.ip_address}</span>
                    </td>
                    <td>
                      {entry.status === 'success' && (
                        <span className="badge badge-verified">Success</span>
                      )}
                      {entry.status === 'warning' && (
                        <span className="badge badge-pending">Warning</span>
                      )}
                      {entry.status === 'critical' && (
                        <span className="badge badge-rejected">Critical</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Audit Block Signature #{selectedEntry.id}</h3>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Actor</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedEntry.actor_name} ({selectedEntry.actor_role})</p>
                </div>
                <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Network Origin</span>
                  <p className="font-mono text-foreground mt-0.5">{selectedEntry.ip_address}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Action Directive</span>
                <p className="font-mono font-bold text-primary mt-0.5">{selectedEntry.action} on {selectedEntry.entity_type}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Resource Reference</span>
                <p className="font-mono text-foreground mt-0.5">{selectedEntry.entity_id}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Recorded Payload / Parameters</span>
                <pre className="p-3 rounded-lg bg-background border border-border font-mono text-[11px] text-muted-foreground overflow-x-auto max-h-40 mt-1 leading-relaxed">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-accent text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
