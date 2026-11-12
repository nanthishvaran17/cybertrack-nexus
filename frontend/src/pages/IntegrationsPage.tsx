import { useState } from 'react';
import {
  Activity, RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Clock, Database, Zap, Play
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
      setSyncToast('All 8 platform connectors synced successfully');
      setTimeout(() => setSyncToast(null), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
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
            Real-time status of external platform collectors, API rate limits, and ingestion jobs.
          </p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={cn('w-4 h-4', isSyncingAll && 'animate-spin')} />
          {isSyncingAll ? 'Syncing Connectors...' : 'Trigger Full Sync'}
        </button>
      </div>

      {/* Health Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase">Active Connectors</p>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-1 tabular-nums">8 / 8</p>
          <p className="text-xs text-emerald-500 mt-1">100% Operational</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase">Sync Success Rate</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">98.6%</p>
          <p className="text-xs text-muted-foreground mt-1">Rolling 24-hour window</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase">Records Ingested</p>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 tabular-nums">5,961</p>
          <p className="text-xs text-muted-foreground mt-1">Activities &amp; badges today</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase">Avg Ingestion Latency</p>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-1 tabular-nums">182 ms</p>
          <p className="text-xs text-muted-foreground mt-1">Edge response time</p>
        </div>
      </div>

      {/* Connector Grid */}
      <div>
        <h2 className="section-title mb-4">Configured Platform Collectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {connectors.map((c) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{c.protocol}</p>
                </div>
                {c.status === 'healthy' && (
                  <span className="badge badge-connected">
                    <CheckCircle2 className="w-3 h-3" /> Healthy
                  </span>
                )}
                {c.status === 'syncing' && (
                  <span className="badge badge-syncing">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Syncing
                  </span>
                )}
                {c.status === 'stale' && (
                  <span className="badge badge-stale">
                    <AlertTriangle className="w-3 h-3" /> Stale
                  </span>
                )}
                {c.status === 'failed' && (
                  <span className="badge badge-failed">
                    <XCircle className="w-3 h-3" /> Failed
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="font-medium text-foreground">{c.lastSync}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="font-medium text-foreground">{c.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{c.successRate}</span>
                </div>
              </div>

              <button
                onClick={() => handleSyncConnector(c.id, c.name)}
                disabled={c.status === 'syncing'}
                className="w-full mt-2 py-1.5 px-3 rounded bg-muted hover:bg-accent text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3 h-3 text-primary" />
                Sync Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sync Job Logs */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h2 className="section-title">Recent Ingestion Job Executions</h2>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Run Identifier</th>
                <th>Target Platform</th>
                <th>Executed At</th>
                <th>Duration</th>
                <th>Records Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {SYNC_LOGS.map((log) => (
                <tr key={log.runId}>
                  <td>
                    <code className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {log.runId}
                    </code>
                  </td>
                  <td className="font-medium text-foreground">{log.platform}</td>
                  <td className="text-xs text-muted-foreground">{log.startedAt}</td>
                  <td className="text-xs text-muted-foreground font-mono">{log.duration}</td>
                  <td className="text-xs font-medium text-foreground tabular-nums">{log.records} items</td>
                  <td>
                    <span className="badge badge-verified">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
