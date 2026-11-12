// Login page — CyberTrack Nexus World-Class Institutional Access
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield, Eye, EyeOff, Loader2, AlertCircle, Key, Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

const schema = z.object({
  email: z.string().email('Enter a valid institutional email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  useSEO({
    title: 'Sign In | CyberTrack Nexus',
    description: 'Sign in to CyberTrack Nexus — Cybersecurity Education Intelligence Platform for Nandha Engineering College, Department of CSE (Cyber Security).',
    canonicalPath: '/login',
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Authentication failed. Please verify credentials or connection.';
      setApiError(message);
    }
  };

  const handleQuickFill = (email: string) => {
    setValue('email', email);
    setValue('password', 'ChangeMe@123');
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl animate-pulse-subtle" />
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-card to-card/80 border border-primary/40 shadow-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Institutional Security Gateway
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              CyberTrack Nexus
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Nandha Engineering College (Autonomous) • Department of CSE (Cyber Security)
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-7 sm:p-8 space-y-5 shadow-2xl border-primary/20">
          <div className="border-b border-border/80 pb-4">
            <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Sign in with Department ID
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your authorized college credentials to access the mesh.
            </p>
          </div>

          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-xs text-rose-400"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">
                Institutional Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                className={cn(
                  'w-full px-3.5 py-2.5 rounded-lg bg-background/80 border text-xs transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                  errors.email ? 'border-destructive' : 'border-input'
                )}
                placeholder="hod@nandhaengg.edu.in"
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-[11px] text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-foreground">
                  Security Passkey
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  className={cn(
                    'w-full px-3.5 py-2.5 pr-10 rounded-lg bg-background/80 border text-xs transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                    errors.password ? 'border-destructive' : 'border-input'
                  )}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1 text-[11px] text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-cyan-500/20',
                'hover:bg-primary/90 transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <span>Access Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Pre-fill Assistance */}
          <div className="pt-3 border-t border-border/70 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-primary" />
              Quick-Fill Demo Credentials:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('hod@nandhaengg.edu.in')}
                className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-mono border border-border/60 transition-colors"
              >
                HOD Account
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@nandhaengg.edu.in')}
                className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-mono border border-border/60 transition-colors"
              >
                Admin Account
              </button>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-[10px] font-mono text-muted-foreground/70">
          TLS 1.3 • AES-256 SESSION TOKENS • NAAC A+ ACCREDITED
        </p>
      </div>
    </div>
  );
}
