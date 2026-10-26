// Student directory with search, filters, pagination, and profile navigation
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, RefreshCw, Users, UserCheck
} from 'lucide-react';
import api from '@/lib/api';
import type { PaginatedResponse, Student } from '@/types';
import { cn, formatDate, statusBadgeClass } from '@/lib/utils';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useCallback(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay])();
  return debounced;
}

export default function StudentsPage() {
  const navigate = useNavigate();
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
    keepPreviousData: true,
  } as Parameters<typeof useQuery>[0]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data ? `${data.total} students found` : 'CSE (Cyber Security) cohort'}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            aria-label="Search students"
            placeholder="Name, register no., email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Year filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            aria-label="Filter by year"
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="text-sm bg-background border border-input rounded-md px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>

        {/* Section filter */}
        <select
          aria-label="Filter by section"
          value={sectionFilter}
          onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
          className="text-sm bg-background border border-input rounded-md px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Sections</option>
          {['A', 'B', 'C', 'D'].map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <AlertCircle className="w-7 h-7 text-destructive" />
            <p className="text-sm">Failed to load students</p>
            <button onClick={() => refetch()} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <Users className="w-8 h-8" />
            <p className="text-sm">No students match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table" aria-label="Student directory">
              <thead>
                <tr>
                  <th>Register No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Mentor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="cursor-pointer"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/students/${student.id}`)}
                    aria-label={`View ${student.full_name}`}
                  >
                    <td className="font-mono text-xs">{student.register_number}</td>
                    <td className="font-medium">{student.full_name}</td>
                    <td className="text-muted-foreground text-xs">{student.institutional_email}</td>
                    <td className="text-center">{student.academic_year}</td>
                    <td className="text-center">{student.section}</td>
                    <td className="text-xs text-muted-foreground">
                      {student.mentor_name ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          {student.mentor_name}
                        </span>
                      ) : (
                        <span className="text-amber-500">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={cn('badge', student.is_active ? 'badge-verified' : 'badge-rejected')}>
                        {student.is_active ? 'Active' : 'Inactive'}
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <p className="text-muted-foreground text-xs">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                className="p-1.5 rounded-md hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                className="p-1.5 rounded-md hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
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
