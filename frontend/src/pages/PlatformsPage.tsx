// Platforms page — shows all platforms, linked accounts, and sync status
import { useQuery } from '@tanstack/react-query';
import { Globe, CheckCircle2, Clock, AlertTriangle, XCircle, Link } from 'lucide-react';
import api from '@/lib/api';
import type { Platform, PlatformAccount } from '@/types';
import { cn, statusBadgeClass, statusLabel, formatDateTime } from '@/lib/utils';

const PLATFORM_ICONS: Record<string, string> = {
  cisco_netacad: '🌐',
  tryhackme: '⚔️',
  hackthebox: '📦',
  portswigger: '🕷️',
};

function SyncStatusIcon({ status }: { status: string }) {
  if (status === 'healthy' || status === 'connected') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === 'stale' || status === 'awaiting_verification') return <Clock className="w-4 h-4 text-amber-500" />;
  if (status === 'failed' || status === 'access_unavailable') return <XCircle className="w-4 h-4 text-red-500" />;
  if (status === 'syncing') return <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />;
  return <div className="w-4 h-4 rounded-full bg-muted" />;
}

export default function PlatformsPage() {
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="page-title">Learning Platforms</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform integrations, linked accounts, and sync health
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-48 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(platforms ?? []).map((platform) => {
            const linked = accountsByPlatform(platform.id);
            const caps = Object.entries(platform.supported_capabilities ?? {});

            return (
              <div key={platform.id} className="bg-card border border-border rounded-lg p-5 space-y-4 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{PLATFORM_ICONS[platform.slug] ?? '🔒'}</div>
                    <div>
                      <h2 className="font-semibold text-sm">{platform.display_name}</h2>
                      {platform.website_url && (
                        <a
                          href={platform.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Link className="w-3 h-3" />
                          {platform.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                  <span className={cn('badge', platform.enabled ? 'badge-verified' : 'badge-rejected')}>
                    {platform.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {/* Capabilities */}
                {caps.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Supported Capabilities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {caps.map(([key, val]) => (
                        <span
                          key={key}
                          className={cn(
                            'badge text-xs',
                            val ? 'badge-verified' : 'badge-unverified'
                          )}
                        >
                          {val ? '✓' : '—'} {key.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked accounts summary */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Linked Accounts ({linked.length})
                  </p>
                  {linked.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No accounts linked</p>
                  ) : (
                    <div className="space-y-1.5 max-h-28 overflow-y-auto">
                      {linked.slice(0, 5).map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                            <SyncStatusIcon status={acc.sync_status} />
                            <span className="truncate">{acc.external_username ?? 'Username pending'}</span>
                          </div>
                          <span className={cn('badge shrink-0', statusBadgeClass(acc.sync_status))}>
                            {statusLabel(acc.sync_status)}
                          </span>
                        </div>
                      ))}
                      {linked.length > 5 && (
                        <p className="text-xs text-muted-foreground">+{linked.length - 5} more</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Not-automated notice for manual platforms */}
                {!platform.supported_capabilities?.api_sync && (
                  <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Automated sync is not available for this platform. Evidence must be submitted manually and verified by staff.
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
