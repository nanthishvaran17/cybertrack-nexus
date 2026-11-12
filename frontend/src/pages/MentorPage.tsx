import { useState } from 'react';
import {
  BookOpen, Users, AlertTriangle, CheckCircle, MessageSquare,
  Search, ShieldAlert, Send, UserCheck
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { cn, getInitials } from '@/lib/utils';

interface Mentee {
  id: string;
  name: string;
  register_number: string;
  year: number;
  section: string;
  email: string;
  thm_score: number;
  leetcode_solved: number;
  certificates: number;
  days_inactive: number;
  intervention_required: boolean;
  notes: { date: string; author: string; text: string }[];
}

const INITIAL_MENTEES: Mentee[] = [
  {
    id: 'm-1',
    name: 'Aravind S',
    register_number: '731622CSR014',
    year: 3,
    section: 'A',
    email: 'aravind.s@nandhaengg.edu.in',
    thm_score: 3420,
    leetcode_solved: 142,
    certificates: 3,
    days_inactive: 2,
    intervention_required: false,
    notes: [
      { date: '2026-11-04', author: 'Dr. S. Ramesh (Mentor)', text: 'Completed Pre-Security path. Encouraged to attempt Junior Penetration Tester.' },
    ],
  },
  {
    id: 'm-2',
    name: 'Bhavani K',
    register_number: '731622CSR022',
    year: 3,
    section: 'A',
    email: 'bhavani.k@nandhaengg.edu.in',
    thm_score: 410,
    leetcode_solved: 24,
    certificates: 0,
    days_inactive: 19,
    intervention_required: true,
    notes: [
      { date: '2026-10-24', author: 'Dr. S. Ramesh (Mentor)', text: 'No activity on TryHackMe or LeetCode for 2+ weeks. Sent reminder.' },
    ],
  },
  {
    id: 'm-3',
    name: 'Dinesh Karthik M',
    register_number: '731622CSR028',
    year: 3,
    section: 'A',
    email: 'dinesh.k@nandhaengg.edu.in',
    thm_score: 5120,
    leetcode_solved: 280,
    certificates: 4,
    days_inactive: 1,
    intervention_required: false,
    notes: [
      { date: '2026-11-08', author: 'Dr. S. Ramesh (Mentor)', text: 'Outstanding progress in network security room series.' },
    ],
  },
  {
    id: 'm-4',
    name: 'Gowtham R',
    register_number: '731622CSR033',
    year: 3,
    section: 'A',
    email: 'gowtham.r@nandhaengg.edu.in',
    thm_score: 850,
    leetcode_solved: 45,
    certificates: 1,
    days_inactive: 12,
    intervention_required: true,
    notes: [
      { date: '2026-10-30', author: 'Dr. S. Ramesh (Mentor)', text: 'Stuck on Linux fundamentals module. Need lab demonstration.' },
    ],
  },
  {
    id: 'm-5',
    name: 'Harini V',
    register_number: '731622CSR039',
    year: 3,
    section: 'A',
    email: 'harini.v@nandhaengg.edu.in',
    thm_score: 2900,
    leetcode_solved: 160,
    certificates: 2,
    days_inactive: 3,
    intervention_required: false,
    notes: [
      { date: '2026-11-01', author: 'Dr. S. Ramesh (Mentor)', text: 'Consistent daily problem solving.' },
    ],
  },
];

export default function MentorPage() {
  useSEO({
    title: 'Mentor Workspace & Cohort Tracking',
    description: 'Faculty mentor workspace for assigned student cybersecurity cohorts, progress logs, and intervention monitoring.',
    canonicalPath: '/mentor',
  });

  const [mentees, setMentees] = useState<Mentee[]>(INITIAL_MENTEES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'intervention' | 'active'>('all');
  const [activeMentee, setActiveMentee] = useState<Mentee | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredMentees = mentees.filter((m) => {
    const matchesSearch =
      search === '' ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.register_number.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'intervention' && m.intervention_required) ||
      (filter === 'active' && !m.intervention_required);
    return matchesSearch && matchesFilter;
  });

  const totalAssigned = mentees.length;
  const interventionCount = mentees.filter((m) => m.intervention_required).length;
  const onTrackCount = totalAssigned - interventionCount;

  const handleAddNote = () => {
    if (!activeMentee || !noteText.trim()) return;
    const newNote = {
      date: new Date().toISOString().slice(0, 10),
      author: 'Faculty Mentor',
      text: noteText.trim(),
    };
    setMentees((prev) =>
      prev.map((m) =>
        m.id === activeMentee.id
          ? { ...m, notes: [newNote, ...m.notes] }
          : m
      )
    );
    setActiveMentee((prev) =>
      prev ? { ...prev, notes: [newNote, ...prev.notes] } : null
    );
    setNoteText('');
  };

  const handleToggleIntervention = (menteeId: string) => {
    setMentees((prev) =>
      prev.map((m) =>
        m.id === menteeId ? { ...m, intervention_required: !m.intervention_required } : m
      )
    );
    if (activeMentee && activeMentee.id === menteeId) {
      setActiveMentee((prev) =>
        prev ? { ...prev, intervention_required: !prev.intervention_required } : null
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Mentor Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Faculty advisory console — Cohort Year 3 (Section A) • Mentee Roster &amp; Interventions
          </p>
        </div>
      </div>

      {/* Cohort Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium uppercase">Assigned Mentees</p>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-1 tabular-nums">{totalAssigned}</p>
          <p className="text-xs text-muted-foreground mt-1">Cohort 2022-2026 CSE-CS</p>
        </div>

        <div className="stat-card border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase">On Track</p>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
            {onTrackCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Regular weekly activity</p>
        </div>

        <div className="stat-card border-destructive/20 bg-destructive/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-destructive font-medium uppercase">Intervention Flags</p>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold mt-1 text-destructive tabular-nums">
            {interventionCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">&gt; 10 days telemetry silence</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentee name, reg number..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'intervention', 'active'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                filter === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70 hover:bg-muted text-muted-foreground'
              )}
            >
              {mode === 'intervention' ? 'Flags Only' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Mentee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMentees.map((mentee) => (
          <div
            key={mentee.id}
            className={cn(
              'bg-card border rounded-lg p-5 space-y-4 transition-all hover:border-primary/40',
              mentee.intervention_required ? 'border-destructive/40 bg-destructive/5' : 'border-border'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                  {getInitials(mentee.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{mentee.name}</h3>
                  <p className="text-xs text-muted-foreground">{mentee.register_number}</p>
                </div>
              </div>
              {mentee.intervention_required ? (
                <span className="badge badge-failed">
                  <ShieldAlert className="w-3 h-3" /> Flagged
                </span>
              ) : (
                <span className="badge badge-verified">
                  <UserCheck className="w-3 h-3" /> Active
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/60 text-center">
              <div>
                <p className="text-xs text-muted-foreground">TryHackMe</p>
                <p className="font-bold text-sm text-foreground mt-0.5">{mentee.thm_score}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">LeetCode</p>
                <p className="font-bold text-sm text-foreground mt-0.5">{mentee.leetcode_solved}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Certificates</p>
                <p className="font-bold text-sm text-foreground mt-0.5">{mentee.certificates}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last active: {mentee.days_inactive === 0 ? 'Today' : `${mentee.days_inactive}d ago`}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> {mentee.notes.length} notes
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveMentee(mentee)}
                className="flex-1 py-1.5 px-3 rounded bg-muted hover:bg-accent text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                View Notes
              </button>
              <button
                onClick={() => handleToggleIntervention(mentee.id)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-medium transition-colors border',
                  mentee.intervention_required
                    ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                    : 'border-destructive/30 text-destructive hover:bg-destructive/10'
                )}
              >
                {mentee.intervention_required ? 'Resolve' : 'Flag'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Note Drawer / Modal */}
      {activeMentee && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-base">Mentoring Notes &amp; Actions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeMentee.name} ({activeMentee.register_number})
                </p>
              </div>
              <button
                onClick={() => setActiveMentee(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {activeMentee.notes.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No mentoring notes recorded yet.</p>
              ) : (
                activeMentee.notes.map((n, i) => (
                  <div key={i} className="bg-muted/50 p-3 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-semibold text-foreground">{n.author}</span>
                      <span>{n.date}</span>
                    </div>
                    <p className="text-foreground/90">{n.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-foreground block">Add New Mentor Note / Intervention</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record mentoring discussion or action plan..."
                  className="flex-1 px-3 py-2 rounded-md bg-background border border-input text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="px-3.5 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
