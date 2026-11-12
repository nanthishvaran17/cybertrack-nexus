import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, AlertTriangle, CheckCircle, MessageSquare,
  Search, ShieldAlert, Send, UserCheck, Plus, Download,
  X, CheckCircle2, ArrowUpRight
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
  const [actionPlanModalOpen, setActionPlanModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Intervention Plan Form
  const [planForm, setPlanForm] = useState({
    targetPlatform: 'TryHackMe',
    targetGoal: '',
    deadline: '2026-11-30',
    mentorRecommendation: '',
  });

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
      author: 'Faculty Mentor (Dr. S. Ramesh)',
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

  const handleCreateActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMentee || !planForm.targetGoal) return;

    const newNote = {
      date: new Date().toISOString().slice(0, 10),
      author: 'Intervention Directive',
      text: `Assigned Target: [${planForm.targetPlatform}] ${planForm.targetGoal} (Deadline: ${planForm.deadline}). ${planForm.mentorRecommendation}`,
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
    setActionPlanModalOpen(false);
    setToastMessage(`Action plan created for ${activeMentee.name}. Sent to student dashboard.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportMentorshipLog = () => {
    const headers = ['Register Number', 'Student Name', 'Days Inactive', 'THM Score', 'LeetCode Solved', 'Intervention Status', 'Last Advisory Note'];
    const rows = mentees.map((m) => [
      m.register_number,
      `"${m.name}"`,
      m.days_inactive,
      m.thm_score,
      m.leetcode_solved,
      m.intervention_required ? 'INTERVENTION_REQUIRED' : 'ON_TRACK',
      `"${m.notes[0]?.text.replace(/"/g, '""') || 'No notes'}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEC_CSE_Cyber_Mentorship_Log_${new Date().toISOString().slice(0, 10)}.csv`);
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
          <h1 className="page-title flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Mentor Advisory Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Faculty advisory console — Cohort Year 3 (Section A) • Mentee Roster, Interventions &amp; Activity Ledger
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportMentorshipLog}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border hover:bg-accent text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            Export Mentorship Log (CSV)
          </button>
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
          <p className="text-xs text-muted-foreground mt-1">Active lab problem solving</p>
        </div>

        <div className="stat-card border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase">Interventions Flagged</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 tabular-nums">
            {interventionCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Inactive &gt; 10 days</p>
        </div>
      </div>

      {/* Main Grid: Mentees List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mentee Roster with Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search mentee name or reg num..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-background/80 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-1 bg-muted/40 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilter('all')}
                className={cn('flex-1 py-1 rounded font-medium transition-colors', filter === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground')}
              >
                All ({totalAssigned})
              </button>
              <button
                onClick={() => setFilter('intervention')}
                className={cn('flex-1 py-1 rounded font-medium transition-colors', filter === 'intervention' ? 'bg-card text-amber-400 shadow-xs' : 'text-muted-foreground')}
              >
                Flagged ({interventionCount})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={cn('flex-1 py-1 rounded font-medium transition-colors', filter === 'active' ? 'bg-card text-emerald-400 shadow-xs' : 'text-muted-foreground')}
              >
                Active ({onTrackCount})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredMentees.map((mentee) => {
              const isSelected = activeMentee?.id === mentee.id;
              return (
                <div
                  key={mentee.id}
                  onClick={() => setActiveMentee(mentee)}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer text-left',
                    isSelected
                      ? 'bg-primary/10 border-primary/40 shadow-sm'
                      : 'bg-card border-border hover:bg-accent/40'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-xs shrink-0">
                        {getInitials(mentee.name)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{mentee.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{mentee.register_number}</p>
                      </div>
                    </div>

                    {mentee.intervention_required && (
                      <span className="p-1 rounded bg-amber-500/10 text-amber-400" title="Intervention Flagged">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-border/50 text-[11px] font-mono text-muted-foreground">
                    <div>
                      <span>THM:</span> <strong className="text-foreground">{mentee.thm_score}</strong>
                    </div>
                    <div>
                      <span>Solved:</span> <strong className="text-foreground">{mentee.leetcode_solved}</strong>
                    </div>
                    <div>
                      <span>Inactive:</span>{' '}
                      <strong className={cn(mentee.days_inactive > 10 ? 'text-amber-400' : 'text-emerald-400')}>
                        {mentee.days_inactive}d
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Mentee Inspection & Intervention Log */}
        <div className="lg:col-span-2 space-y-4">
          {activeMentee ? (
            <div className="glass-card p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-black text-base shrink-0">
                    {getInitials(activeMentee.name)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{activeMentee.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">
                      {activeMentee.register_number} • Year {activeMentee.year} (Section {activeMentee.section}) • {activeMentee.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/students/${activeMentee.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    View Cyber Dossier <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleToggleIntervention(activeMentee.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5',
                      activeMentee.intervention_required
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    )}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {activeMentee.intervention_required ? 'Flagged for Intervention' : 'Flag for Intervention'}
                  </button>
                </div>
              </div>

              {/* Action Plan Trigger Banner */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Targeted Remediation &amp; Skill Milestones
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Assign structured lab challenges on TryHackMe or LeetCode with mandatory completion deadlines.
                  </p>
                </div>
                <button
                  onClick={() => setActionPlanModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Create Target Directive
                </button>
              </div>

              {/* Advisory Notes Feed */}
              <div className="space-y-3">
                <h3 className="section-title flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Mentoring &amp; Counseling Journal
                </h3>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeMentee.notes.map((note, index) => (
                    <div key={index} className="p-3 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{note.author}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{note.date}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{note.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Log advisory note, meeting observation, or guidance remark..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-muted-foreground space-y-2 flex flex-col items-center justify-center min-h-[400px]">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">Select a mentee from the cohort list</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                View student cybersecurity metrics, inactivity timeline, counseling logs, and assign remedial action plans.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Target Directive / Action Plan Modal */}
      {actionPlanModalOpen && activeMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm text-foreground">Assign Action Directive — {activeMentee.name}</h2>
              </div>
              <button
                onClick={() => setActionPlanModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActionPlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Platform</label>
                  <select
                    value={planForm.targetPlatform}
                    onChange={(e) => setPlanForm({ ...planForm, targetPlatform: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="TryHackMe">TryHackMe Rooms</option>
                    <option value="HackTheBox">HackTheBox Active Machine</option>
                    <option value="LeetCode">LeetCode Problem Set</option>
                    <option value="Cisco NetAcad">Cisco Networking Module</option>
                    <option value="PortSwigger">PortSwigger Web Academy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={planForm.deadline}
                    onChange={(e) => setPlanForm({ ...planForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Directive Goal / Specific Tasks</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Wireshark Traffic Analysis Room + 5 Network Fundamentals"
                  value={planForm.targetGoal}
                  onChange={(e) => setPlanForm({ ...planForm, targetGoal: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mentor Advisory Guidance</label>
                <textarea
                  rows={3}
                  placeholder="Additional guidance note or remedial recommendation for the student..."
                  value={planForm.mentorRecommendation}
                  onChange={(e) => setPlanForm({ ...planForm, mentorRecommendation: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActionPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm"
                >
                  Commit Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
