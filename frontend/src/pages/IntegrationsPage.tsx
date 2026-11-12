import { useState } from 'react';
import {
  Activity, RefreshCw, CheckCircle2,
  Clock, Plus, X, Globe, Terminal, Check, Sliders
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';

interface Connector {
  id: string;
  name: string;
  slug: string;
  endpoint: string;
  protocol: string;
  status: 'healthy' | 'syncing' | 'stale' | 'failed';
  lastSync: string;
  recordsSynced: number;
  successRate: string;
  latencyMs: number;
  rateLimitUsed: number;
  rateLimitMax: number;
}

const CONNECTORS: Connector[] = [
  {
    id: 'c-1',
    name: 'LeetCode',
    slug: 'leetcode',
    endpoint: 'https://leetcode.com/graphql',
    protocol: 'GraphQL v2',
    status: 'healthy',
    lastSync: '4 mins ago',
    recordsSynced: 1240,
    successRate: '99.8%',
    latencyMs: 142,
    rateLimitUsed: 1280,
    rateLimitMax: 5000,
  },
  {
    id: 'c-2',
    name: 'TryHackMe',
    slug: 'tryhackme',
    endpoint: 'https://tryhackme.com/api/v2/public-profile',
    protocol: 'REST JSON',
    status: 'healthy',
    lastSync: '12 mins ago',
    recordsSynced: 840,
    successRate: '99.4%',
    latencyMs: 188,
    rateLimitUsed: 840,
    rateLimitMax: 2000,
  },
  {
    id: 'c-3',
    name: 'HackTheBox',
    slug: 'hackthebox',
    endpoint: 'https://www.hackthebox.com/api/v4/user/profile',
    protocol: 'REST OAuth2',
    status: 'healthy',
    lastSync: '28 mins ago',
    recordsSynced: 412,
    successRate: '98.9%',
    latencyMs: 220,
    rateLimitUsed: 412,
    rateLimitMax: 1000,
  },
  {
    id: 'c-4',
    name: 'CodeChef',
    slug: 'codechef',
    endpoint: 'https://www.codechef.com/api/ratings',
    protocol: 'REST JSON',
    status: 'stale',
    lastSync: '3 hours ago',
    recordsSynced: 610,
    successRate: '94.2%',
    latencyMs: 310,
    rateLimitUsed: 610,
    rateLimitMax: 1500,
  },
  {
    id: 'c-5',
    name: 'HackerRank',
    slug: 'hackerrank',
    endpoint: 'https://www.hackerrank.com/rest/hackers',
    protocol: 'REST JSON',
    status: 'healthy',
    lastSync: '45 mins ago',
    recordsSynced: 780,
    successRate: '99.1%',
    latencyMs: 165,
    rateLimitUsed: 780,
    rateLimitMax: 3000,
  },
  {
    id: 'c-6',
    name: 'GitHub',
    slug: 'github',
    endpoint: 'https://api.github.com/graphql',
    protocol: 'GraphQL v4',
    status: 'healthy',
    lastSync: '6 mins ago',
    recordsSynced: 1540,
    successRate: '100%',
    latencyMs: 95,
    rateLimitUsed: 1540,
    rateLimitMax: 5000,
  },
  {
    id: 'c-7',
    name: 'PortSwigger Web Security',
    slug: 'portswigger',
    endpoint: 'https://portswigger.net/web-security/learning-path',
    protocol: 'Adapter v1',
    status: 'healthy',
    lastSync: '1 hour ago',
    recordsSynced: 320,
    successRate: '97.5%',
    latencyMs: 270,
    rateLimitUsed: 320,
    rateLimitMax: 1000,
  },
  {
    id: 'c-8',
    name: 'OverTheWire / Bandit',
    slug: 'overthewire',
    endpoint: 'internal://telemetry/otw-validator',
    protocol: 'Audit Agent',
    status: 'healthy',
    lastSync: '2 hours ago',
    recordsSynced: 215,
    successRate: '99.0%',
    latencyMs: 65,
    rateLimitUsed: 215,
    rateLimitMax: 1000,
  },
];

interface SyncLog {
  runId: string;
  platform: string;
  startedAt: string;
  duration: string;
  records: number;
  status: 'completed' | 'running' | 'failed';
}

const SYNC_LOGS: SyncLog[] = [
  { runId: 'sync-run-9024', platform: 'LeetCode', startedAt: '10:42 AM', duration: '4.2s', records: 184, status: 'completed' },
  { runId: 'sync-run-9023', platform: 'TryHackMe', startedAt: '10:35 AM', duration: '6.8s', records: 142, status: 'completed' },
  { runId: 'sync-run-9022', platform: 'GitHub', startedAt: '10:30 AM', duration: '3.1s', records: 210, status: 'completed' },
  { runId: 'sync-run-9021', platform: 'CodeChef', startedAt: '08:15 AM', duration: '12.4s', records: 88, status: 'completed' },
  { runId: 'sync-run-9020', platform: 'HackTheBox', startedAt: '07:45 AM', duration: '8.0s', records: 64, status: 'completed' },
];

export default function IntegrationsPage() {
  useSEO({
    title: 'Integration Health & Telemetry Status',
    description: 'Real-time telemetry, API adapter health, rate limits, and ingestion jobs across integrated platforms.',
    canonicalPath: '/integrations',
  });

  const [connectors, setConnectors] = useState<Connector[]>(CONNECTORS);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [inspectConnector, setInspectConnector] = useState<Connector | null>(null);
  const [addConnectorModalOpen, setAddConnectorModalOpen] = useState(false);
  const [cadenceModalOpen, setCadenceModalOpen] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState('6');

  // New Connector form state
  const [newConnector, setNewConnector] = useState({
    name: '',
    slug: '',
    endpoint: '',
    protocol: 'REST JSON',
  });

  const handleSyncConnector = (id: string, name: string) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'syncing', lastSync: 'Just now' } : c))
    );
    setTimeout(() => {
      setConnectors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'healthy', lastSync: 'Just now' } : c))
      );
      setSyncToast(`Successfully synced telemetry for ${name}`);
      setTimeout(() => setSyncToast(null), 3000);
    }, 1200);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setConnectors((prev) => prev.map((c) => ({ ...c, status: 'syncing' })));
    setTimeout(() => {
      setConnectors((prev) => prev.map((c) => ({ ...c, status: 'healthy', lastSync: 'Just now' })));
      setIsSyncingAll(false);
      setSyncToast('All platform telemetry connectors synchronized successfully.');
      setTimeout(() => setSyncToast(null), 3000);
    }, 2000);
  };

  const handleAddConnectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnector.name || !newConnector.endpoint) return;

    const created: Connector = {
      id: `c-${Date.now()}`,
      name: newConnector.name,
      slug: newConnector.slug || newConnector.name.toLowerCase().replace(/\s+/g, '-'),
      endpoint: newConnector.endpoint,
      protocol: newConnector.protocol,
      status: 'healthy',
      lastSync: 'Just registered',
      recordsSynced: 0,
      successRate: '100%',
      latencyMs: 110,
      rateLimitUsed: 0,
      rateLimitMax: 2000,
    };

    setConnectors([created, ...connectors]);
    setAddConnectorModalOpen(false);
    setSyncToast(`Integration connector "${created.name}" deployed to ingestion engine.`);
    setNewConnector({ name: '', slug: '', endpoint: '', protocol: 'REST JSON' });
    setTimeout(() => setSyncToast(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Integration Health &amp; Telemetry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time status of external platform collectors, API rate limits, and automated ingestion cycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCadenceModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
            Sync Cadence: Every {selectedCadence}h
          </button>
          <button
            onClick={() => setAddConnectorModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold text-foreground transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            Deploy Collector
          </button>
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-primary/20"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isSyncingAll && 'animate-spin')} />
            {isSyncingAll ? 'Syncing...' : 'Trigger Full Sync'}
          </button>
        </div>
      </div>

      {/* Grid of Connectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {connectors.map((c) => (
          <div
            key={c.id}
            className="glass-card p-4 space-y-3 hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => setInspectConnector(c)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.protocol}</p>
              </div>
              <span
                className={cn(
                  'badge text-[10px] font-mono capitalize',
                  c.status === 'healthy' ? 'badge-verified' : c.status === 'stale' ? 'badge-pending' : 'badge-rejected'
                )}
              >
                {c.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-muted-foreground">
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-foreground font-semibold">{c.latencyMs}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Records:</span>
                <span className="text-foreground font-semibold">{c.recordsSynced}</span>
              </div>
              <div className="flex justify-between">
                <span>Success:</span>
                <span className="text-emerald-400 font-bold">{c.successRate}</span>
              </div>
            </div>

            {/* Rate limit usage bar */}
            <div className="pt-2 border-t border-border/50 space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>API Quota:</span>
                <span>{c.rateLimitUsed} / {c.rateLimitMax}</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.round((c.rateLimitUsed / c.rateLimitMax) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-mono text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {c.lastSync}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSyncConnector(c.id, c.name);
                }}
                className="text-primary hover:underline font-bold"
              >
                Sync
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Jobs Ledger */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">Telemetry Dispatch History &amp; Worker Jobs</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated asynchronous background cron executions and payload parsing logs.
            </p>
          </div>
          <span className="badge badge-verified">
            <CheckCircle2 className="w-3 h-3" /> Workers Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table" aria-label="Ingestion log table">
            <thead>
              <tr>
                <th>Run Identifier</th>
                <th>Target Platform</th>
                <th>Started At</th>
                <th>Execution Time</th>
                <th>Records Ingested</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SYNC_LOGS.map((log) => (
                <tr key={log.runId}>
                  <td>
                    <code className="text-xs font-mono text-primary font-bold">{log.runId}</code>
                  </td>
                  <td>
                    <span className="font-semibold text-foreground text-xs">{log.platform}</span>
                  </td>
                  <td>
                    <span className="text-xs text-muted-foreground">{log.startedAt}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono text-muted-foreground">{log.duration}</span>
                  </td>
                  <td>
                    <span className="text-xs font-mono font-bold text-foreground">{log.records} telemetry items</span>
                  </td>
                  <td>
                    <span className="badge badge-verified capitalize">
                      <Check className="w-3 h-3" /> {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connector Payload Inspector Modal */}
      {inspectConnector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">API Telemetry Inspector — {inspectConnector.name}</h2>
              </div>
              <button
                onClick={() => setInspectConnector(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Endpoint Route</span>
                <p className="p-2.5 rounded-lg bg-background border border-border text-primary break-all">{inspectConnector.endpoint}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                  <span className="text-muted-foreground text-[10px]">Round-Trip Latency</span>
                  <p className="text-base font-bold text-foreground mt-0.5">{inspectConnector.latencyMs} ms</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 border border-border/60">
                  <span className="text-muted-foreground text-[10px]">Ingestion Reliability</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{inspectConnector.successRate}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Latest JSON Handshake Payload</span>
                <pre className="p-3 rounded-xl bg-background border border-border text-[11px] text-muted-foreground overflow-x-auto max-h-48 leading-relaxed">
{JSON.stringify(
  {
    status: 200,
    adapter: inspectConnector.slug,
    ssl_certified: true,
    protocol: inspectConnector.protocol,
    records_synced: inspectConnector.recordsSynced,
    rate_limits: {
      used: inspectConnector.rateLimitUsed,
      capacity: inspectConnector.rateLimitMax,
      reset_epoch: Date.now() + 3600000,
    },
    sha256_hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  },
  null,
  2
)}
                </pre>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setInspectConnector(null)}
                  className="px-4 py-2 font-sans font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  Close Inspector
                </button>
                <button
                  onClick={() => {
                    handleSyncConnector(inspectConnector.id, inspectConnector.name);
                    setInspectConnector(null);
                  }}
                  className="px-4 py-2 font-sans font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Force Immediate Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Custom Collector Modal */}
      {addConnectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Deploy External Telemetry Collector</h2>
              </div>
              <button
                onClick={() => setAddConnectorModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddConnectorSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Collector Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PicoCTF / Blue Team Labs"
                  value={newConnector.name}
                  onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">API / Ingestion Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.picoctf.org/v1/telemetry"
                  value={newConnector.endpoint}
                  onChange={(e) => setNewConnector({ ...newConnector, endpoint: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Integration Protocol</label>
                <select
                  value={newConnector.protocol}
                  onChange={(e) => setNewConnector({ ...newConnector, protocol: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="REST JSON">REST JSON API</option>
                  <option value="GraphQL v4">GraphQL Endpoint</option>
                  <option value="REST OAuth2">OAuth2 Authenticated API</option>
                  <option value="Audit Agent">Local Campus Audit Daemon</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAddConnectorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Deploy Collector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cadence Config Modal */}
      {cadenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Automated Ingestion Frequency</h2>
              </div>
              <button
                onClick={() => setCadenceModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Set how often the CyberTrack Nexus automated workers query TryHackMe, LeetCode, and HackTheBox APIs for student telemetry.
              </p>

              <div className="space-y-2">
                {['2', '6', '12', '24'].map((hours) => (
                  <label
                    key={hours}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs transition-colors',
                      selectedCadence === hours
                        ? 'bg-primary/10 border-primary text-foreground font-bold'
                        : 'border-border hover:bg-accent/40 text-muted-foreground'
                    )}
                  >
                    <span>Poll Every {hours} Hours ({hours === '2' ? 'High Frequency' : hours === '6' ? 'Recommended' : 'Batch Economy'})</span>
                    <input
                      type="radio"
                      name="cadence"
                      value={hours}
                      checked={selectedCadence === hours}
                      onChange={() => setSelectedCadence(hours)}
                      className="accent-primary"
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCadenceModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
