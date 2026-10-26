// Evidence submission queue and review page
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, FileText, ChevronDown
} from 'lucide-react';
import api from '@/lib/api';
import type { EvidenceSubmission } from '@/types';
import { cn, formatDateTime, statusBadgeClass, statusLabel } from '@/lib/utils';
import { useAuth } from '@/features/auth/AuthContext';

export default function EvidencePage() {
  const { hasRole } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('awaiting');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const isReviewer = hasRole('hod', 'admin', 'staff');

  const { data, isLoading, isError, refetch } = useQuery<EvidenceSubmission[]>({
    queryKey: ['evidence', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?submission_status=${statusFilter}` : '';
      return (await api.get<EvidenceSubmission[]>(`/evidence${params}`)).data;
    },
    staleTime: 30_000,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, decision, reason }: { id: string; decision: string; reason: string }) => {
      await api.post(`/evidence/${id}/review`, { decision, reason: reason || null });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['evidence'] });
      setReviewingId(null);
      setReviewReason('');
    },
  });

  const counts = {
    awaiting: data?.filter((e) => e.submission_status === 'awaiting').length ?? 0,
    verified: data?.filter((e) => e.submission_status === 'verified').length ?? 0,
    rejected: data?.filter((e) => e.submission_status === 'rejected').length ?? 0,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Evidence Verification</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review submitted certificates and lab completions
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md border border-border hover:bg-accent transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {(['awaiting', 'verified', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
              statusFilter === s
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {statusLabel(s)}
            {s === 'awaiting' && counts.awaiting > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                {counts.awaiting}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <p className="text-sm">Failed to load submissions</p>
            <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
            <FileCheck className="w-8 h-8" />
            <p className="text-sm">
              {statusFilter === 'awaiting' ? 'No pending submissions — great work!' : `No ${statusFilter} submissions`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((sub) => (
              <div key={sub.id} className="p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sub.original_filename ?? 'Evidence document'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {sub.evidence_type.replace(/_/g, ' ')} · Submitted {formatDateTime(sub.submitted_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('badge', statusBadgeClass(sub.submission_status))}>
                      {statusLabel(sub.submission_status)}
                    </span>

                    {/* Review actions — staff/HOD/admin only, awaiting only */}
                    {isReviewer && sub.submission_status === 'awaiting' && (
                      <>
                        {reviewingId === sub.id ? (
                          <div className="flex flex-col gap-2 mt-2 w-64">
                            <textarea
                              value={reviewReason}
                              onChange={(e) => setReviewReason(e.target.value)}
                              placeholder="Optional reason / note…"
                              rows={2}
                              className="w-full px-2.5 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => reviewMutation.mutate({ id: sub.id, decision: 'approved', reason: reviewReason })}
                                disabled={reviewMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => reviewMutation.mutate({ id: sub.id, decision: 'rejected', reason: reviewReason })}
                                disabled={reviewMutation.isPending}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 font-medium"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                              <button
                                onClick={() => { setReviewingId(null); setReviewReason(''); }}
                                className="text-xs text-muted-foreground hover:text-foreground px-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingId(sub.id)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Review <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
