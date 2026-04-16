import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from '../context/ThemeContext';
import { useAuth, saveUserProfile, loadUserProfile } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import type { UserRole, AuthUser } from '../context/AuthContext';
import { TrendingUp, ChevronDown, Check, Users, Zap, BarChart2, Calendar, Tag } from 'lucide-react';

// ─── Animated Background Canvas ───────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { palette } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = canvas.parentElement?.offsetWidth || 600;
    let H = canvas.parentElement?.offsetHeight || 800;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = canvas.parentElement?.offsetWidth || 600;
      H = canvas.parentElement?.offsetHeight || 800;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', resize);

    // Floating orbs
    const orbs = Array.from({ length: 6 }, (_, idx) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 80 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      hue: idx % 2 === 0 ? palette.primary : palette.accent,
      alpha: 0.08 + Math.random() * 0.08,
    }));

    // Grid lines
    const gridLines = Array.from({ length: 16 }, (_, i) => ({
      x1: Math.random() * W,
      y1: Math.random() * H,
      x2: Math.random() * W,
      y2: Math.random() * H,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      alpha: 0.04 + Math.random() * 0.06,
    }));

    // Floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.5 + Math.random() * 1.5,
      vy: -0.2 - Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.2,
      alpha: 0.3 + Math.random() * 0.4,
    }));

    function draw() {
      ctx!.clearRect(0, 0, W, H);

      // Base gradient
      const bg = ctx!.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, palette.bg);
      bg.addColorStop(0.5, palette.surface);
      bg.addColorStop(1, palette.bg);
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, W, H);

      // Orbs
      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = W + orb.r;
        if (orb.x > W + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = H + orb.r;
        if (orb.y > H + orb.r) orb.y = -orb.r;

        const grad = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, orb.hue + 'cc');
        grad.addColorStop(1, orb.hue + '00');
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx!.fillStyle = grad;
        ctx!.globalAlpha = orb.alpha;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // Grid network lines
      gridLines.forEach(line => {
        line.progress += line.speed;
        if (line.progress > 1) {
          line.x1 = Math.random() * W;
          line.y1 = Math.random() * H;
          line.x2 = Math.random() * W;
          line.y2 = Math.random() * H;
          line.progress = 0;
        }
        const px = line.x1 + (line.x2 - line.x1) * line.progress;
        const py = line.y1 + (line.y2 - line.y1) * line.progress;
        ctx!.beginPath();
        ctx!.moveTo(line.x1, line.y1);
        ctx!.lineTo(px, py);
        ctx!.strokeStyle = palette.primary;
        ctx!.globalAlpha = line.alpha;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      });

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = palette.accent;
        ctx!.globalAlpha = p.alpha * 0.6;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [palette]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

// ─── Feature Pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label }: { icon: any; label: string }) {
  const { palette } = useTheme();
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${palette.primary}18`,
        border: `1px solid ${palette.primary}40`,
        color: palette.textMuted,
      }}
    >
      <Icon size={12} style={{ color: palette.primary }} />
      {label}
    </div>
  );
}

// ─── Role Dropdown ─────────────────────────────────────────────────────────────
const roles: { value: UserRole; label: string; desc: string; emoji: string }[] = [
  { value: 'creator', label: 'Creator', desc: 'List & fund your content', emoji: '🎬' },
  { value: 'fan',     label: 'Fan',     desc: 'Invest in creators you love', emoji: '⭐' },
];

function RoleDropdown({
  selected,
  onChange,
}: {
  selected: UserRole;
  onChange: (v: UserRole) => void;
}) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = roles.find(r => r.value === selected)!;

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all"
        style={{
          backgroundColor: palette.surfaceAlt,
          border: `1.5px solid ${open ? palette.primary : palette.border}`,
          color: palette.text,
          outline: 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{current.emoji}</span>
          <div className="text-left">
            <p className="font-semibold text-sm" style={{ color: palette.text }}>
              {current.label}
            </p>
            <p className="text-xs" style={{ color: palette.textMuted }}>
              {current.desc}
            </p>
          </div>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: palette.textMuted,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50"
          style={{
            backgroundColor: palette.surfaceAlt,
            border: `1.5px solid ${palette.border}`,
            boxShadow: `0 8px 32px ${palette.bg}99`,
          }}
        >
          {roles.map(role => (
            <button
              key={role.value}
              type="button"
              onClick={() => { onChange(role.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors"
              style={{
                backgroundColor: selected === role.value ? `${palette.primary}18` : 'transparent',
                color: palette.text,
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${palette.primary}18`)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = selected === role.value ? `${palette.primary}18` : 'transparent')}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{role.emoji}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm" style={{ color: palette.text }}>
                    {role.label}
                  </p>
                  <p className="text-xs" style={{ color: palette.textMuted }}>
                    {role.desc}
                  </p>
                </div>
              </div>
              {selected === role.value && (
                <Check size={14} style={{ color: palette.primary }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Google Button ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Profile Setup Step ────────────────────────────────────────────────────────
function ProfileSetup({ user, onComplete }: { user: AuthUser; onComplete: () => void }) {
  const { palette } = useTheme();
  const [dob, setDob] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    callApi<string[]>('getGenres_App')
      .then(res => setAllGenres(res.data ?? []))
      .catch(() => setAllGenres([]));
  }, []);

  const toggle = (g: string) =>
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleSave = () => {
    saveUserProfile(user.email, { dob, genres: selected });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: `${palette.bg}f0` }}>
      <div
        className="w-full max-w-md rounded-3xl p-7 shadow-2xl"
        style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
      >
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: palette.gradient }}
          >
            <Tag size={24} style={{ color: palette.onPrimary }} />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: palette.text }}>Personalize your experience</h2>
          <p className="text-sm" style={{ color: palette.textMuted }}>
            Help us show you the most relevant creators and campaigns.
          </p>
        </div>

        {/* DOB */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: palette.textMuted }}>
            <Calendar size={12} /> Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              backgroundColor: palette.surfaceAlt,
              border: `1px solid ${palette.border}`,
              color: palette.text,
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Genre picks */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: palette.textMuted }}>
            <Tag size={12} />
            {user.role === 'creator' ? 'Your channel genres' : 'Genres you love'} (pick any)
          </label>
          <div className="flex flex-wrap gap-2">
            {allGenres.map(g => {
              const on = selected.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(g)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    backgroundColor: on ? palette.primary : palette.surfaceAlt,
                    color: on ? palette.onPrimary : palette.textMuted,
                    border: `1px solid ${on ? palette.primary : palette.border}`,
                  }}
                >
                  {on && <span className="mr-1">✓</span>}{g}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{ background: palette.gradient, color: palette.onPrimary }}
        >
          Continue
        </button>
        <button
          onClick={onComplete}
          className="w-full mt-2 py-2 text-xs"
          style={{ color: palette.textSubtle }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Main Login Page ───────────────────────────────────────────────────────────
export function Login() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [role, setRole] = useState<UserRole>('fan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);

  // If session already active, redirect to the appropriate landing page
  useEffect(() => {
    if (user && !pendingUser) {
      doNavigate(user);
    }
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const doNavigate = (u: AuthUser) => {
    const redirect = sessionStorage.getItem('fanfolio_post_login_redirect');
    if (redirect) {
      sessionStorage.removeItem('fanfolio_post_login_redirect');
      navigate(redirect, { replace: true });
    } else {
      navigate(u.role === 'creator' ? '/onboard' : '/fanlanding', { replace: true });
    }
  };

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const profile = await res.json();
      const authUser: AuthUser = {
        name: profile.name ?? profile.email,
        email: profile.email,
        picture: profile.picture ?? '',
        role,
      };
      signIn(authUser);
      // New user → show profile setup before redirecting
      const existing = loadUserProfile(profile.email);
      if (!existing) {
        setPendingUser(authUser);
      } else {
        doNavigate(authUser);
      }
    } catch {
      setError('Failed to fetch profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setLoading(false);
      setError('Google sign-in failed. Please try again.');
    },
    onNonOAuthError: () => {
      // Fires when popup is closed/cancelled by the user
      setLoading(false);
    },
  });

  const handleSignIn = () => {
    setLoading(true);
    setError('');
    googleLogin();
  };

  if (pendingUser) {
    return (
      <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
        <ProfileSetup user={pendingUser} onComplete={() => doNavigate(pendingUser)} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {/* ── LEFT PANEL: Animated background ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center">
        <AnimatedBackground />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12 text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: palette.gradient }}
            >
              <TrendingUp size={22} color={palette.onPrimary} strokeWidth={2.5} />
            </div>
            <span className="font-black text-2xl tracking-tight" style={{ color: palette.text }}>
              Fan<span style={{ color: palette.accent }}>Z</span>
              <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Folio
              </span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-black leading-tight mb-4" style={{ color: palette.text }}>
            Invest in Creators<br />
            <span style={{ background: palette.accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              You Believe In
            </span>
          </h1>

          <p className="text-base leading-relaxed mb-10 max-w-sm" style={{ color: palette.textMuted }}>
            The first fan-powered funding platform connecting creators with their most passionate supporters.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <FeaturePill icon={BarChart2} label="AI Underwriting" />
            <FeaturePill icon={Zap} label="Instant Funding" />
            <FeaturePill icon={Users} label="3,800+ Investors" />
          </div>

          {/* Stats */}
          <div
            className="flex gap-8 px-8 py-5 rounded-2xl"
            style={{
              backgroundColor: `${palette.surface}cc`,
              border: `1px solid ${palette.border}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            {[
              { val: '142', label: 'Creators' },
              { val: '$2.4M', label: 'Funded' },
              { val: '94%', label: 'Accuracy' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: palette.primary }}>{s.val}</p>
                <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${palette.bg}80, transparent)` }}
        />
      </div>

      {/* ── RIGHT PANEL: Login form ──────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative"
        style={{ backgroundColor: palette.bg }}
      >
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: palette.gradient }}
          >
            <TrendingUp size={17} color={palette.onPrimary} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tight" style={{ color: palette.text }}>
            Fan<span style={{ color: palette.accent }}>Z</span>
            <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Folio
            </span>
          </span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-1.5" style={{ color: palette.text }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: palette.textMuted }}>
              Sign in to your FanZFolio account
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            {/* Role label */}
            <label className="block text-xs font-semibold tracking-wider mb-2" style={{ color: palette.textMuted }}>
              I AM A
            </label>

            {/* Role dropdown */}
            <RoleDropdown selected={role} onChange={setRole} />

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: palette.border }} />
              <span className="text-xs" style={{ color: palette.textSubtle }}>continue with</span>
              <div className="flex-1 h-px" style={{ backgroundColor: palette.border }} />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                backgroundColor: loading ? `${palette.surfaceAlt}` : '#FFFFFF',
                color: '#1A1A1A',
                border: '1.5px solid #E0E0E0',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}
            >
              {loading ? (
                <span
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: `${palette.primary}40`, borderTopColor: 'transparent' }}
                />
              ) : (
                <GoogleIcon />
              )}
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* Error */}
            {error && (
              <p className="mt-3 text-xs text-center" style={{ color: palette.danger }}>
                {error}
              </p>
            )}
          </div>

          {/* Redirect note */}
          <p className="text-xs text-center mt-5" style={{ color: palette.textSubtle }}>
            {role === 'creator'
              ? "Signing in as Creator will take you to the onboarding flow."
              : "Signing in as Fan will take you to the marketplace."}
          </p>

          {/* Terms */}
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: palette.textSubtle }}>
            By signing in, you agree to our{' '}
            <span className="underline cursor-pointer" style={{ color: palette.textMuted }}>Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer" style={{ color: palette.textMuted }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
