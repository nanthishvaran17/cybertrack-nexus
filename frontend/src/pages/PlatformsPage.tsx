// Platforms page — shows all platforms, linked accounts, and sync status
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, AlertTriangle, XCircle, ExternalLink,
  Shield, Server, Terminal, Radio, Cpu, Check, Minus
} from 'lucide-react';
import api from '@/lib/api';
import type { Platform, PlatformAccount } from '@/types';
import { cn, statusBadgeClass, statusLabel } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

function PlatformBrandIcon({ slug }: { slug: string }) {
  switch (slug) {
    case 'tryhackme':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/30 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm">
          <Shield className="w-5 h-5 text-rose-400" />
        </div>
      );
    case 'hackthebox':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
          <Cpu className="w-5 h-5 text-emerald-400" />
        </div>
      );
    case 'cisco_netacad':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-600/30 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
          <Radio className="w-5 h-5 text-sky-400" />
        </div>
      );
    case 'portswigger':
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
          <Terminal className="w-5 h-5 text-amber-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <Server className="w-5 h-5" />
        </div>
      );
  }
}

function SyncStatusIcon({ status }: { status: string }) {
  if (status === 'healthy' || status === 'connected') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  if (status === 'stale' || status === 'awaiting_verification') return <Clock className="w-4 h-4 text-amber-400" />;
  if (status === 'failed' || status === 'access_unavailable') return <XCircle className="w-4 h-4 text-rose-400" />;
  if (status === 'syncing') return <AlertTriangle className="w-4 h-4 text-sky-400 animate-pulse" />;
  return <div className="w-4 h-4 rounded-full bg-muted" />;
}

export default function PlatformsPage() {
  useSEO({
    title: 'Integrated Learning Platforms & CTF Trackers',
    description: 'Track external cybersecurity learning platforms including TryHackMe, HackTheBox, Cisco NetAcad, and PortSwigger Web Security.',
    canonicalPath: '/platforms',
  });

  const { data: platforms, isLoading: pLoading } = useQuery<Platform[]>({
    queryKey: ['platforms'],
    queryFn: async () => (await api.get<Platform[]>('/platforms')).data,
    staleTime: 120_000,
  });

  const { data: accounts, isLoading: aLoading } = useQuery<PlatformAccount[]>({
    queryKey: ['platform-accounts'],
    queryFn: async () => (await api.get<PlatformAccount[]>('/platform-accounts')).data,
    staleTime: 60_000,
  });

  const isLoading = pLoading || aLoading;

  const accountsByPlatform = (platformId: string) =>
    (accounts ?? []).filter((a) => a.platform_id === platformId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <Server className="w-7 h-7 text-primary" />
            Learning &amp; CTF Platforms
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Institutional platform connectors, real-time sync endpoints, and student account rosters.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-56 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(platforms ?? []).map((platform) => {
            const linked = accountsByPlatform(platform.id);
            const caps = Object.entries(platform.supported_capabilities ?? {});

            return (
              <div key={platform.id} className="glass-card p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <PlatformBrandIcon slug={platform.slug} />
                    <div>
                      <h2 className="font-bold text-base text-foreground">{platform.display_name}</h2>
                      {platform.website_url && (
                        <a
                          href={platform.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {platform.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={cn('badge', platform.enabled ? 'badge-verified' : 'badge-rejected')}>
                    {platform.enabled ? 'Active Connector' : 'Disabled'}
                  </span>
                </div>

                {/* Capabilities */}
                {caps.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Adapter Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {caps.map(([key, val]) => (
                        <span
                          key={key}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors',
                            val
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-muted/50 text-muted-foreground border-border/50'
                          )}
                        >
                          {val ? <Check className="w-3 h-3 text-emerald-400" /> : <Minus className="w-3 h-3 text-muted-foreground" />}
                          {key.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked accounts summary */}
                <div className="pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Linked Student Profiles ({linked.length})
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {linked.filter(a => a.sync_status === 'healthy' || a.sync_status === 'connected').length} synced
                    </span>
                  </div>

                  {linked.length === 0 ? (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-center">
                      <p className="text-xs text-muted-foreground italic">No student accounts linked yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {linked.slice(0, 5).map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-card/60 border border-border/40 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-2 text-muted-foreground truncate">
                            <SyncStatusIcon status={acc.sync_status} />
                            <span className="font-medium text-foreground truncate">{acc.external_username ?? 'Username pending'}</span>
                          </div>
                          <span className={cn('badge shrink-0', statusBadgeClass(acc.sync_status))}>
                            {statusLabel(acc.sync_status)}
                          </span>
                        </div>
                      ))}
                      {linked.length > 5 && (
                        <p className="text-[11px] text-primary hover:underline cursor-pointer pt-1 font-semibold">
                          +{linked.length - 5} more student accounts
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Notice for manual platforms */}
                {!platform.supported_capabilities?.api_sync && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>Automated telemetry API is not public for this platform. Lab reports and credentials are submitted via the cryptographically hashed Evidence Queue.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
