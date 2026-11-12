import { useState, useMemo } from 'react';
import {
  Award, Search, Filter, CheckCircle2, Clock, XCircle,
  Download, ShieldCheck, Calendar, FileText
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';

interface CertificateRecord {
  id: string;
  student_name: string;
  register_number: string;
  year: number;
  section: string;
  title: string;
  issuer: string;
  credential_id: string;
  issue_date: string;
  verification_status: 'verified' | 'awaiting' | 'rejected';
  score?: string;
  evidence_url?: string;
}

const INITIAL_CERTIFICATES: CertificateRecord[] = [
  {
    id: 'cert-1',
    student_name: 'Dharun Kumar S',
    register_number: '731622CSR021',
    year: 3,
    section: 'A',
    title: 'Pre-Security Learning Path',
    issuer: 'TryHackMe',
    credential_id: 'THM-PRESEC-948123',
    issue_date: '2026-10-14',
    verification_status: 'verified',
    score: '100% Completed',
  },
  {
    id: 'cert-2',
    student_name: 'Kavitha R',
    register_number: '731622CSR045',
    year: 3,
    section: 'B',
    title: 'Introduction to Cyber Security',
    issuer: 'Cisco Networking Academy',
    credential_id: 'CSCO-NETACAD-44120',
    issue_date: '2026-10-18',
    verification_status: 'verified',
    score: 'Grade A',
  },
  {
    id: 'cert-3',
    student_name: 'Arunmozhi Varman M',
    register_number: '731621CSR008',
    year: 4,
    section: 'A',
    title: 'Certified Ethical Hacker (v12)',
    issuer: 'EC-Council',
    credential_id: 'ECC-CEH-884920',
    issue_date: '2026-09-30',
    verification_status: 'verified',
    score: 'Score: 92%',
  },
  {
    id: 'cert-4',
    student_name: 'Santhosh Kumar P',
    register_number: '731623CSR089',
    year: 2,
    section: 'A',
    title: 'Jr Penetration Tester Path',
    issuer: 'TryHackMe',
    credential_id: 'THM-JRPT-552194',
    issue_date: '2026-11-02',
    verification_status: 'awaiting',
  },
  {
    id: 'cert-5',
    student_name: 'Deepa Lakshmi V',
    register_number: '731622CSR025',
    year: 3,
    section: 'A',
    title: 'AWS Certified Security - Specialty',
    issuer: 'Amazon Web Services',
    credential_id: 'AWS-SEC-9923812',
    issue_date: '2026-10-29',
    verification_status: 'awaiting',
  },
  {
    id: 'cert-6',
    student_name: 'Vigneshwaran K',
    register_number: '731621CSR112',
    year: 4,
    section: 'B',
    title: 'Security+ (SY0-701)',
    issuer: 'CompTIA',
    credential_id: 'COMP-SEC-77312',
    issue_date: '2026-08-20',
    verification_status: 'verified',
    score: 'Score: 820/900',
  },
  {
    id: 'cert-7',
    student_name: 'Monisha S',
    register_number: '731623CSR054',
    year: 2,
    section: 'B',
    title: 'Ethical Hacking Essentials (EHE)',
    issuer: 'Coursera / Codered',
    credential_id: 'CRS-EHE-102941',
    issue_date: '2026-07-15',
    verification_status: 'rejected',
  },
  {
    id: 'cert-8',
    student_name: 'Naveen Raj C',
    register_number: '731622CSR062',
    year: 3,
    section: 'B',
    title: 'Starting Out in Cyber Security',
    issuer: 'HackTheBox Academy',
    credential_id: 'HTB-ACAD-33109',
    issue_date: '2026-11-05',
    verification_status: 'awaiting',
  },
];

export default function CertificationsPage() {
  useSEO({
    title: 'Industry Certifications & Registry',
    description: 'Verified student cybersecurity certifications, credential IDs, and accreditation records for Department of CSE.',
    canonicalPath: '/certifications',
    keywords: ['certifications', 'cybersecurity credentials', 'TryHackMe', 'CompTIA', 'CEH', 'Nandha Engineering College'],
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'awaiting' | 'rejected'>('all');
  const [issuerFilter, setIssuerFilter] = useState<string>('all');
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);

  const issuers = useMemo(() => {
    const list = Array.from(new Set(INITIAL_CERTIFICATES.map((c) => c.issuer)));
    return ['all', ...list];
  }, []);

  const filtered = useMemo(() => {
    return INITIAL_CERTIFICATES.filter((item) => {
      const matchSearch =
        search === '' ||
        item.student_name.toLowerCase().includes(search.toLowerCase()) ||
        item.register_number.toLowerCase().includes(search.toLowerCase()) ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.credential_id.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || item.verification_status === statusFilter;
      const matchIssuer = issuerFilter === 'all' || item.issuer === issuerFilter;

      return matchSearch && matchStatus && matchIssuer;
    });
  }, [search, statusFilter, issuerFilter]);

  const stats = useMemo(() => {
    return {
      total: INITIAL_CERTIFICATES.length,
      verified: INITIAL_CERTIFICATES.filter((c) => c.verification_status === 'verified').length,
      awaiting: INITIAL_CERTIFICATES.filter((c) => c.verification_status === 'awaiting').length,
      rejected: INITIAL_CERTIFICATES.filter((c) => c.verification_status === 'rejected').length,
    };
  }, []);

  const handleExportCSV = () => {
    const header = 'Register Number,Student Name,Year,Section,Certificate Title,Issuer,Credential ID,Issue Date,Status\n';
    const rows = filtered
      .map(
        (c) =>
          `"${c.register_number}","${c.student_name}","Year ${c.year}","${c.section}","${c.title}","${c.issuer}","${c.credential_id}","${c.issue_date}","${c.verification_status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cybertrack_certifications_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header with Semantic H1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Certifications &amp; Accreditations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verified student cybersecurity credentials, professional certifications, and validation registry.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-card border border-border hover:bg-accent text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4 text-muted-foreground" />
          Export Registry (.CSV)
        </button>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground font-medium uppercase">Total Submitted</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Across 8 issuers</p>
        </div>
        <div className="stat-card border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">Verified</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
            {stats.verified}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Approved for accreditation</p>
        </div>
        <div className="stat-card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">Awaiting Review</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.awaiting}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pending faculty audit</p>
        </div>
        <div className="stat-card border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Rejected</p>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 tabular-nums">
            {stats.rejected}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Unverified credentials</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, register #, certificate, ID..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {(['all', 'verified', 'awaiting', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {status}
            </button>
          ))}

          <select
            value={issuerFilter}
            onChange={(e) => setIssuerFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {issuers.map((iss) => (
              <option key={iss} value={iss}>
                {iss === 'all' ? 'All Issuers' : iss}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Certificate</th>
                <th>Issuing Body</th>
                <th>Credential ID</th>
                <th>Issue Date</th>
                <th>Verification</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    No certifications found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id}>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">{cert.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.register_number} • Year {cert.year}-{cert.section}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-foreground">{cert.title}</p>
                        {cert.score && <p className="text-xs text-primary">{cert.score}</p>}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted text-xs font-medium">
                        {cert.issuer}
                      </span>
                    </td>
                    <td>
                      <code className="text-xs font-mono bg-accent/60 px-1.5 py-0.5 rounded text-muted-foreground">
                        {cert.credential_id}
                      </code>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {cert.issue_date}
                      </div>
                    </td>
                    <td>
                      {cert.verification_status === 'verified' && (
                        <span className="badge badge-verified">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {cert.verification_status === 'awaiting' && (
                        <span className="badge badge-pending">
                          <Clock className="w-3 h-3" /> Awaiting
                        </span>
                      )}
                      {cert.verification_status === 'rejected' && (
                        <span className="badge badge-rejected">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base">Credential Verification Record</h3>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Certificate Name</p>
                <p className="text-base font-bold text-foreground mt-0.5">{selectedCert.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Issuing Organization</p>
                  <p className="font-medium text-foreground">{selectedCert.issuer}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Issue Date</p>
                  <p className="font-medium text-foreground">{selectedCert.issue_date}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-medium text-foreground">{selectedCert.student_name} ({selectedCert.register_number})</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Cryptographic / Credential ID</p>
                <code className="text-xs font-mono block bg-muted p-2 rounded mt-1 break-all text-primary">
                  {selectedCert.credential_id}
                </code>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Audit Verification Status</p>
                <div className="mt-1">
                  {selectedCert.verification_status === 'verified' && (
                    <span className="badge badge-verified">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Department Review Board
                    </span>
                  )}
                  {selectedCert.verification_status === 'awaiting' && (
                    <span className="badge badge-pending">
                      <Clock className="w-3.5 h-3.5" /> In Faculty Review Queue
                    </span>
                  )}
                  {selectedCert.verification_status === 'rejected' && (
                    <span className="badge badge-rejected">
                      <XCircle className="w-3.5 h-3.5" /> Rejected — Credential could not be validated
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 text-xs font-medium rounded-md bg-muted hover:bg-accent text-foreground"
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
