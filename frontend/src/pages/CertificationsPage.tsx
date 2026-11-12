import { useState, useMemo } from 'react';
import {
  Award, Search, CheckCircle2, Clock, XCircle,
  Download, ShieldCheck, FileText, Plus, X,
  Shield, Hash
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

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

  const [certificates, setCertificates] = useState<CertificateRecord[]>(INITIAL_CERTIFICATES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'awaiting' | 'rejected'>('all');
  const [issuerFilter, setIssuerFilter] = useState<string>('all');
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [addCertModalOpen, setAddCertModalOpen] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; cert?: CertificateRecord } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Cert State
  const [newCert, setNewCert] = useState({
    student_name: '',
    register_number: '',
    year: 3,
    section: 'A',
    title: '',
    issuer: 'TryHackMe',
    credential_id: '',
  });

  const issuers = useMemo(() => {
    const list = Array.from(new Set(certificates.map((c) => c.issuer)));
    return ['all', ...list];
  }, [certificates]);

  const filtered = useMemo(() => {
    return certificates.filter((item) => {
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
  }, [certificates, search, statusFilter, issuerFilter]);

  const stats = useMemo(() => {
    return {
      total: certificates.length,
      verified: certificates.filter((c) => c.verification_status === 'verified').length,
      awaiting: certificates.filter((c) => c.verification_status === 'awaiting').length,
      rejected: certificates.filter((c) => c.verification_status === 'rejected').length,
    };
  }, [certificates]);

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

  const handleOnlineVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    const match = certificates.find(
      (c) =>
        c.credential_id.toLowerCase() === verifyInput.trim().toLowerCase() ||
        c.register_number.toLowerCase() === verifyInput.trim().toLowerCase()
    );
    if (match) {
      setVerifyResult({ found: true, cert: match });
    } else {
      setVerifyResult({ found: false });
    }
  };

  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: CertificateRecord = {
      id: `cert-${Date.now()}`,
      student_name: newCert.student_name,
      register_number: newCert.register_number.toUpperCase(),
      year: newCert.year,
      section: newCert.section,
      title: newCert.title,
      issuer: newCert.issuer,
      credential_id: newCert.credential_id || `NEC-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      issue_date: new Date().toISOString().slice(0, 10),
      verification_status: 'awaiting',
    };
    setCertificates([created, ...certificates]);
    setAddCertModalOpen(false);
    setToastMessage(`Certificate "${created.title}" registered. Awaiting faculty verification.`);
    setNewCert({
      student_name: '',
      register_number: '',
      year: 3,
      section: 'A',
      title: '',
      issuer: 'TryHackMe',
      credential_id: '',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
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
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            Export Registry (.CSV)
          </button>
          <button
            onClick={() => setAddCertModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Register Credential
          </button>
        </div>
      </div>

      {/* Quick Verifier & Audit Lookup Tool */}
      <div className="glass-card p-4 sm:p-5 border border-primary/25 bg-gradient-to-r from-card via-card to-primary/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Instant Credential Validator</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Verify any student certificate authenticity by credential ID or register number.
            </p>
          </div>

          <form onSubmit={handleOnlineVerify} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Hash className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter Credential ID (e.g. THM-PRESEC-948123)..."
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-colors shrink-0"
            >
              Verify Now
            </button>
          </form>
        </div>

        {verifyResult && (
          <div className="mt-4 pt-3 border-t border-border/60 animate-fade-in">
            {verifyResult.found && verifyResult.cert ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Authentic Credential Verified:</strong> {verifyResult.cert.title} awarded to {verifyResult.cert.student_name} ({verifyResult.cert.register_number}) by {verifyResult.cert.issuer}.
                  </span>
                </div>
                <button onClick={() => setVerifyResult(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-400">
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No matching cryptographic record found in institutional ledger for &ldquo;{verifyInput}&rdquo;.</span>
                </div>
                <button onClick={() => setVerifyResult(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
              </div>
            )}
          </div>
        )}
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
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.verified / stats.total) * 100)}% Verified Rate
          </p>
        </div>
        <div className="stat-card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">Awaiting</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 tabular-nums">
            {stats.awaiting}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pending faculty review</p>
        </div>
        <div className="stat-card border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Rejected</p>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 tabular-nums">
            {stats.rejected}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Invalid or duplicate</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            aria-label="Search certifications"
            placeholder="Search by student, register number, title, or credential ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by verification status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified only</option>
            <option value="awaiting">Awaiting review</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            aria-label="Filter by issuing body"
            value={issuerFilter}
            onChange={(e) => setIssuerFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Issuers</option>
            {issuers.filter((i) => i !== 'all').map((iss) => (
              <option key={iss} value={iss}>{iss}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table" aria-label="Certifications table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Certificate Title</th>
                <th>Issuing Body</th>
                <th>Credential ID</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No certifications found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-accent/40 transition-colors">
                    <td>
                      <div>
                        <p className="font-semibold text-foreground">{cert.student_name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {cert.register_number} • Year {cert.year}-{cert.section}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{cert.title}</p>
                        {cert.score && (
                          <span className="text-[10px] text-primary font-mono font-medium">{cert.score}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs font-medium text-foreground">{cert.issuer}</span>
                    </td>
                    <td>
                      <code className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        {cert.credential_id}
                      </code>
                    </td>
                    <td>
                      <span className="text-xs text-muted-foreground">{cert.issue_date}</span>
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
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-bold"
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

      {/* Register Credential Modal */}
      {addCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Register External Certification Record</h2>
              </div>
              <button
                onClick={() => setAddCertModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCertSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arunmozhi Varman"
                    value={newCert.student_name}
                    onChange={(e) => setNewCert({ ...newCert, student_name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Register Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 731621CSR008"
                    value={newCert.register_number}
                    onChange={(e) => setNewCert({ ...newCert, register_number: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Certificate Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CompTIA Security+ / AWS Certified Security"
                  value={newCert.title}
                  onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Issuing Authority</label>
                  <select
                    value={newCert.issuer}
                    onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="TryHackMe">TryHackMe</option>
                    <option value="HackTheBox Academy">HackTheBox Academy</option>
                    <option value="Cisco Networking Academy">Cisco Networking Academy</option>
                    <option value="CompTIA">CompTIA</option>
                    <option value="EC-Council">EC-Council</option>
                    <option value="Amazon Web Services">Amazon Web Services</option>
                    <option value="Coursera / Codered">Coursera / Codered</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Credential ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. THM-PRESEC-948123"
                    value={newCert.credential_id}
                    onChange={(e) => setNewCert({ ...newCert, credential_id: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAddCertModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Register Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
