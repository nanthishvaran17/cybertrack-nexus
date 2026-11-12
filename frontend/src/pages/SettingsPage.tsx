import { useState } from 'react';
import {
  Settings, Building, Key, Shield, Save, CheckCircle2,
  Sliders
} from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  useSEO({
    title: 'Department Settings & Configuration',
    description: 'Configure academic year targets, platform integration secrets, and administrative access policies for CyberTrack Nexus.',
    canonicalPath: '/settings',
  });

  const [savedToast, setSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'targets' | 'api' | 'roles'>('general');

  // Form states
  const [deptCode, setDeptCode] = useState('CSE-CS');
  const [deptName, setDeptName] = useState('Computer Science and Engineering (Cyber Security)');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [minThmRooms, setMinThmRooms] = useState('25');
  const [minLeetcode, setMinLeetcode] = useState('100');
  const [minCertificates, setMinCertificates] = useState('2');
  const [syncFrequency, setSyncFrequency] = useState('6');
  const [autoFlagDays, setAutoFlagDays] = useState('14');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-emerald-500/40 text-foreground px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Department configuration parameters saved successfully.</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Department Settings &amp; Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage institutional benchmarks, platform sync intervals, and administrative access controls.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-border space-x-4">
        <button
          onClick={() => setActiveTab('general')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'general'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Building className="w-4 h-4" />
          General Info
        </button>
        <button
          onClick={() => setActiveTab('targets')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'targets'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Sliders className="w-4 h-4" />
          Benchmarking Targets
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'api'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Key className="w-4 h-4" />
          API &amp; Polling Keys
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={cn(
            'pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5',
            activeTab === 'roles'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Shield className="w-4 h-4" />
          Access Roles
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === 'general' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="section-title">Department &amp; Academic Institution Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Department Code</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Current Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1.5">Full Department Name</label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'targets' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="section-title">Accreditation &amp; Performance Benchmarks</h2>
            <p className="text-xs text-muted-foreground">
              Configure minimum competency thresholds expected per semester for NAAC / NBA Criterion assessments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Min TryHackMe Rooms</label>
                <input
                  type="number"
                  value={minThmRooms}
                  onChange={(e) => setMinThmRooms(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Min LeetCode Problems</label>
                <input
                  type="number"
                  value={minLeetcode}
                  onChange={(e) => setMinLeetcode(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Required Certificates / Year</label>
                <input
                  type="number"
                  value={minCertificates}
                  onChange={(e) => setMinCertificates(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Mentor Inactivity Alert (Days)</label>
                <input
                  type="number"
                  value={autoFlagDays}
                  onChange={(e) => setAutoFlagDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="section-title">Telemetry Collector &amp; Sync Configuration</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Scheduled Sync Polling Interval (Hours)</label>
                <select
                  value={syncFrequency}
                  onChange={(e) => setSyncFrequency(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="1">Every 1 Hour</option>
                  <option value="6">Every 6 Hours (Recommended)</option>
                  <option value="12">Every 12 Hours</option>
                  <option value="24">Daily at 00:00 UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Nexus Webhook Ingestion Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    readOnly
                    value="ctn_live_sec_9941a82f0c78a"
                    className="flex-1 px-3 py-2 rounded-md bg-muted font-mono text-xs border border-input cursor-default text-muted-foreground"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded bg-accent hover:bg-accent/80 text-xs font-medium"
                    onClick={() => navigator.clipboard.writeText('ctn_live_sec_9941a82f0c78a')}
                  >
                    Copy Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="section-title">Institutional Role Hierarchy &amp; Permissions</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border/80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Head of Department (HOD)</p>
                  <p className="text-muted-foreground">Full cryptographic audit access, role delegation, accreditation exports.</p>
                </div>
                <span className="badge badge-verified">Active</span>
              </div>
              <div className="p-3 rounded-lg border border-border/80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Faculty Mentor / Staff</p>
                  <p className="text-muted-foreground">Cohort supervision, evidence verification, intervention logging.</p>
                </div>
                <span className="badge badge-verified">Active</span>
              </div>
              <div className="p-3 rounded-lg border border-border/80 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Enrolled Student</p>
                  <p className="text-muted-foreground">Platform linking, evidence submission, personal progress dashboard.</p>
                </div>
                <span className="badge badge-verified">Active</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
}
