// Student directory with search, filters, pagination, and profile navigation — World-class design
import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, Users, UserCheck,
  GraduationCap, Mail, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';
import type { PaginatedResponse, Student } from '@/types';
import { cn, getInitials } from '@/lib/utils';
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
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
                      <span className={cn('badge', student.is_active ? 'badge-verified' : 'badge-rejected')}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Profile <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/70 text-xs">
            <p className="text-muted-foreground font-mono">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total} students
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-border/80 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-md bg-muted/60 font-mono text-xs text-foreground font-semibold">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-border/80 hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
