import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme, palettes } from '../context/ThemeContext';
import type { PaletteKey } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, BarChart2, LogOut, Palette, ChevronDown, Bookmark, Search, GitCompare, Home } from 'lucide-react';

const paletteKeys: PaletteKey[] = ['midnight', 'ocean', 'forest', 'luxe', 'vibeon', 'light'];
const paletteColors: Record<PaletteKey, string> = {
  midnight: '#8B3DFF',
  ocean: '#2563EB',
  forest: '#00C896',
  luxe: '#E8B423',
  vibeon: '#7C3AED',
  light: '#0B1F3A',
};

function UserDropdown({ onClose }: { onClose: () => void }) {
  const { palette, paletteKey, setPalette } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-2 w-72 rounded-2xl overflow-hidden z-[100]"
      style={{
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border}`,
        boxShadow: `0 12px 40px ${palette.bg}cc`,
      }}
    >
      {/* User info */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="flex items-center gap-3">
          {user?.picture
            ? <img src={user.picture} alt={user?.name} referrerPolicy="no-referrer" className="w-9 h-9 rounded-full object-cover" />
            : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: palette.gradient, color: palette.onPrimary }}>{user?.name[0]}</div>
          }
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: palette.text }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: palette.textMuted }}>{user?.email}</p>
          </div>
        </div>
        <div
          className="mt-2 text-xs px-2 py-0.5 rounded-full w-fit capitalize"
          style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
        >
          {user?.role}
        </div>
      </div>

      {/* Theme switcher */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${palette.border}` }}>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Palette size={12} style={{ color: palette.textSubtle }} />
          <p className="text-xs font-semibold tracking-wider" style={{ color: palette.textSubtle }}>THEME</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {paletteKeys.map(key => {
            const p = palettes[key];
            const isSelected = paletteKey === key;
            return (
              <button
                key={key}
                onClick={() => setPalette(key)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all"
                style={{
                  backgroundColor: isSelected ? `${p.primary}22` : `${palette.surfaceAlt}`,
                  border: `1px solid ${isSelected ? p.primary : 'transparent'}`,
                }}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: paletteColors[key], border: key === 'light' ? '1.5px solid #CBD5E1' : 'none' }} />
                <span className="text-xs font-medium" style={{ color: isSelected ? p.primary : palette.textMuted }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-4 py-2">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: palette.danger }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${palette.danger}12`)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    ...(user?.role === 'brand' ? [
      { label: 'Brand Home', path: '/brand-landing' },
      { label: 'Find Creators', path: '/creator-search' },
    ] : [
      { label: 'Marketplace', path: '/marketplace' },
    ]),
    ...(user?.role === 'creator' ? [
      { label: 'My Dashboard', path: '/report' },
      { label: 'New Analysis', path: '/onboard' },
    ] : []),
    { label: 'About Us', path: '/about' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        backgroundColor: `${palette.bg}ee`,
        borderBottom: `1px solid ${palette.border}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: palette.gradient }}
        >
          <TrendingUp size={16} color={palette.onPrimary} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-base tracking-tight" style={{ color: palette.text }}>
          Fan<span style={{ color: palette.accent }}>Z</span><span style={{ color: palette.primary }}>Folio</span>
        </span>
      </button>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className="text-sm transition-colors"
            style={{ color: isActive(link.path) ? palette.primary : palette.textMuted }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {user?.role === 'fan' && (
          <>
            <button
              onClick={() => navigate('/watchlist')}
              className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: isActive('/watchlist') ? palette.primary : palette.textMuted,
                backgroundColor: isActive('/watchlist') ? `${palette.primary}18` : 'transparent',
              }}
            >
              <Bookmark size={14} />
              Watchlist
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: isActive('/portfolio') ? palette.primary : palette.textMuted,
                backgroundColor: isActive('/portfolio') ? `${palette.primary}18` : 'transparent',
              }}
            >
              <BarChart2 size={14} />
              Portfolio
            </button>
          </>
        )}

        {user?.role === 'brand' && (
          <button
            onClick={() => navigate('/creator-comparison')}
            className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: isActive('/creator-comparison') ? palette.primary : palette.textMuted,
              backgroundColor: isActive('/creator-comparison') ? `${palette.primary}18` : 'transparent',
            }}
          >
            <GitCompare size={14} />
            Compare
          </button>
        )}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1 rounded-xl transition-colors"
              style={{
                backgroundColor: dropdownOpen ? `${palette.primary}18` : 'transparent',
                border: `1px solid ${dropdownOpen ? palette.primary : 'transparent'}`,
              }}
            >
              {user.picture
                ? <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover" />
                : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: palette.gradient, color: palette.onPrimary }}>{user.name[0]}</div>
              }
              <span className="hidden md:block text-sm font-medium max-w-[100px] truncate" style={{ color: palette.text }}>{user.name}</span>
              <ChevronDown
                size={14}
                style={{
                  color: palette.textMuted,
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
            {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="text-sm px-4 py-1.5 rounded-lg font-medium transition-colors"
            style={{ color: palette.textMuted, border: `1px solid ${palette.border}` }}
          >
            Sign In
          </button>
        )}

        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="text-sm px-4 py-1.5 rounded-lg font-medium"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}
