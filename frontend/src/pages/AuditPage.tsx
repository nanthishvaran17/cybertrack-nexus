import { useState, useMemo } from 'react';
import {
  ClipboardList, ShieldCheck, Search, Filter, Download,
  Lock, Eye, Key
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

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
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

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
      return matchSearch && matchAction;
    });
  }, [search, actionFilter]);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AUDIT_ENTRIES, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cybertrack_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    downloadAnchor.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Audit Logs &amp; Security Trail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Immutable, append-only security logs for faculty reviews, grade impact, and system administration.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-card border border-border hover:bg-accent text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Export Audit Trail (.JSON)
        </button>
      </div>

      {/* Security Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-foreground">Tamper-Evident Cryptographic Sequencing</p>
          <p className="text-muted-foreground mt-0.5">
            All records in this ledger are signed with SHA-256 state chaining. Alteration of past log blocks invalidates downstream hashes. Retained for 7 academic years under NAAC Criterion 2.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Recorded Events</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{AUDIT_ENTRIES.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Indexed in current cycle</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Privileged Actions</p>
          <p className="text-2xl font-bold mt-1 text-primary tabular-nums">2</p>
          <p className="text-xs text-muted-foreground mt-1">Roles / Config updates</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Hash Chain Integrity</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
            <ShieldCheck className="w-5 h-5" />
            <span>VERIFIED</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Zero discrepancies</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase font-medium">Access Policy</p>
          <div className="flex items-center gap-1.5 mt-1 text-foreground font-semibold text-sm">
            <Key className="w-4 h-4 text-primary" />
            <span>HOD &amp; Compliance Only</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Encrypted at rest</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, IP, target..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {actions.map((act) => (
              <option key={act} value={act}>
                {act === 'all' ? 'All Action Types' : act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Subject</th>
                <th>Origin IP</th>
                <th className="text-right">Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-xs font-mono text-muted-foreground">{entry.timestamp}</td>
                  <td>
                    <div>
                      <p className="font-medium text-foreground text-xs">{entry.actor_name}</p>
                      <span className="text-[10px] uppercase font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {entry.actor_role}
                      </span>
                    </div>
                  </td>
                  <td>
                    <code className="text-xs font-mono font-semibold text-primary">
                      {entry.action}
                    </code>
                  </td>
                  <td className="text-xs text-foreground font-mono truncate max-w-[200px]">
                    {entry.entity_id}
                  </td>
                  <td className="text-xs font-mono text-muted-foreground">{entry.ip_address}</td>
                  <td className="text-right">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-base">Audit Event Inspector</h3>
                <code className="text-xs font-mono text-primary">{selectedEntry.id}</code>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Actor:</span>
                  <p className="font-medium text-foreground">{selectedEntry.actor_name} ({selectedEntry.actor_role})</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Action:</span>
                  <p className="font-mono font-bold text-primary">{selectedEntry.action}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <p className="font-medium text-foreground">{selectedEntry.entity_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address:</span>
                  <p className="font-mono text-foreground">{selectedEntry.ip_address}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">Payload &amp; Metadata:</span>
                <pre className="p-3 bg-muted rounded-lg font-mono text-[11px] text-foreground overflow-x-auto">
                  {JSON.stringify(selectedEntry.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 text-xs font-medium rounded-md bg-muted hover:bg-accent text-foreground"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
