// ── CyberTrack Nexus — Shared TypeScript types ───────────────────────────────

export type UserRole = 'hod' | 'admin' | 'staff' | 'student';

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  roles: UserRole[];
  is_active: boolean;
}

export interface Student {
  id: string;
  register_number: string;
  full_name: string;
  institutional_email: string;
  academic_year: number;
  section: string;
  department_id: string;
  is_active: boolean;
  mentor_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

export interface Platform {
  id: string;
  slug: string;
  display_name: string;
  enabled: boolean;
  supported_capabilities: Record<string, boolean>;
  website_url?: string | null;
}

export type VerificationStatus = 'unverified' | 'awaiting' | 'verified' | 'rejected';
export type SyncStatus = 'not_linked' | 'awaiting_verification' | 'connected' | 'syncing' | 'healthy' | 'stale' | 'failed' | 'access_unavailable' | 'unsupported';

export interface PlatformAccount {
  id: string;
  student_id: string;
  platform_id: string;
  platform_name: string;
  external_username?: string | null;
  profile_url?: string | null;
  verification_status: VerificationStatus;
  sync_status: SyncStatus;
  linked_at: string;
  last_successful_sync_at?: string | null;
}

export type EvidenceType = 'certificate' | 'lab_completion' | 'course_completion' | 'achievement' | 'other';

export interface EvidenceSubmission {
  id: string;
  student_id: string;
  evidence_type: EvidenceType;
  original_filename?: string | null;
  submission_status: VerificationStatus;
  submitted_at: string;
  platform_id?: string | null;
}

export interface OverviewMetrics {
  total_active_students: number;
  students_with_linked_platforms: number;
  verified_certificates: number;
  pending_evidence: number;
  sync_success_rate: number | null;
  platform_adoption: { platform: string; count: number }[];
}

export interface ApiError {
  detail: string;
}
