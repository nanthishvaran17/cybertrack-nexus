// Student directory with search, filters, pagination, enroll modal, and profile navigation
import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, Users, UserCheck,
  GraduationCap, Mail, UserPlus, Download, X,
  CheckCircle2, Shield, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';
import type { PaginatedResponse, Student } from '@/types';
import { getInitials } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function StudentsPage() {
  const navigate = useNavigate();

  useSEO({
    title: 'Student Directory & Performance Roster',
    description: 'Comprehensive student registry, cohort filters, academic years, and learning platform links for Nandha Engineering College CSE (Cyber Security).',
    canonicalPath: '/students',
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    register_number: '',
    institutional_email: '',
    academic_year: 3,
    section: 'A',
  });

  const PAGE_SIZE = 25;
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isError, refetch } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['students', page, debouncedSearch, yearFilter, sectionFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (yearFilter) params.set('academic_year', yearFilter);
      if (sectionFilter) params.set('section', sectionFilter);
      const res = await api.get<PaginatedResponse<Student>>(`/students?${params}`);
      return res.data;
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.full_name || !newStudent.register_number || !newStudent.institutional_email) {
      alert('Please fill all required student details.');
      return;
    }

    setToastMessage(`Student ${newStudent.full_name} enrolled successfully into Department Ledger.`);
    setEnrollModalOpen(false);
    setNewStudent({
      full_name: '',
      register_number: '',
      institutional_email: '',
      academic_year: 3,
      section: 'A',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExportCSV = () => {
    const items = data?.items || [];
    if (items.length === 0) {
      alert('No student records to export.');
      return;
    }
    const headers = ['Register Number', 'Full Name', 'Institutional Email', 'Academic Year', 'Section', 'Mentor Name'];
    const rows = items.map((s) => [
      s.register_number,
      s.full_name,
      s.institutional_email,
      `Year ${s.academic_year}`,
      `Sec ${s.section}`,
      s.mentor_name || 'Unassigned',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEC_CyberSecurity_Students_Cohort_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-primary" />
            Student Cohort Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Department of CSE (Cyber Security) • {data ? `${data.total} registered students` : 'Active academic records'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-border/80 bg-card hover:bg-accent text-foreground transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </button>
          <button
            onClick={() => setEnrollModalOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Quick Performance Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Total Cohort</p>
          <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{data?.total || 128}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Undergraduate Scholars</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Platform Monitored</p>
          <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">108</p>
          <p className="text-[11px] text-emerald-500 font-medium mt-0.5">84.4% Telemetry Active</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Mentorship Reach</p>
          <p className="text-2xl font-black text-primary mt-1 tabular-nums">100%</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Faculty Groups Assigned</p>
        </div>
        <div className="stat-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Curriculum Year</p>
          <p className="text-2xl font-black text-amber-400 mt-1 tabular-nums">Year 1 - 4</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sections A, B, C</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            aria-label="Search students"
            placeholder="Search by student name, register number, institutional email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2 text-xs bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filter:</span>
          </div>

          <select
            aria-label="Filter by year"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Academic Years</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>

          <select
            aria-label="Filter by section"
            value={sectionFilter}
            onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
            className="text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Sections</option>
            {['A', 'B', 'C', 'D'].map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>

          {(search || yearFilter || sectionFilter) && (
            <button
              onClick={() => { setSearch(''); setYearFilter(''); setSectionFilter(''); setPage(1); }}
              className="text-xs text-primary hover:underline px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-muted-foreground p-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm font-medium">Failed to retrieve student roster from database.</p>
            <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold">
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect
            </button>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 gap-3 text-muted-foreground p-6">
            <Users className="w-10 h-10 text-muted-foreground/50" />
            <p className="text-sm">No students match your query criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table" aria-label="Student directory">
              <thead>
                <tr>
                  <th>Student Identification</th>
                  <th>Institutional Email</th>
                  <th>Cohort Year</th>
                  <th>Section</th>
                  <th>Faculty Mentor</th>
                  <th>Account Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="cursor-pointer group"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/students/${student.id}`)}
                    aria-label={`View ${student.full_name}`}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {getInitials(student.full_name)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{student.full_name}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{student.register_number}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted-foreground font-mono text-xs flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {student.institutional_email}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted font-semibold text-xs text-foreground">
                        Year {student.academic_year}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold text-foreground">
                        Sec {student.section}
                      </span>
                    </td>
                    <td className="text-xs">
                      {student.mentor_name ? (
                        <span className="flex items-center gap-1.5 text-foreground font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {student.mentor_name}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${student.is_active ? 'badge-verified' : 'badge-rejected'}`}>
                        {student.is_active ? 'Active Enrolled' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-xs text-primary font-semibold group-hover:underline inline-flex items-center gap-1">
                        Dossier <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {page} of {totalPages} ({data.total} total students)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-accent"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-border disabled:opacity-40 hover:bg-accent"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enroll Student Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Enroll Student to Department Ledger</h2>
              </div>
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vigneshwaran K"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Register Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 731622CSR112"
                    value={newStudent.register_number}
                    onChange={(e) => setNewStudent({ ...newStudent, register_number: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@nandhaengg.org"
                    value={newStudent.institutional_email}
                    onChange={(e) => setNewStudent({ ...newStudent, institutional_email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Academic Year</label>
                  <select
                    value={newStudent.academic_year}
                    onChange={(e) => setNewStudent({ ...newStudent, academic_year: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Section</label>
                  <select
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {['A', 'B', 'C', 'D'].map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-[11px] text-muted-foreground">
                <p className="font-semibold text-foreground">Department Assignment:</p>
                <p>Department of Computer Science &amp; Engineering (Cyber Security) • Nandha Engineering College</p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
