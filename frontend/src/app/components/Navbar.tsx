import { useNavigate, useLocation } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, BarChart2, Home, Layers } from 'lucide-react';

export function Navbar() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'How It Works', path: '/#how' },
    { label: 'List Your Channel', path: '/onboard' },
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
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: palette.gradient }}
        >
          <TrendingUp size={16} color={palette.onPrimary} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-base tracking-tight" style={{ color: palette.text }}>
          Fan<span style={{ color: palette.primary }}>Folio</span>
        </span>
      </button>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path.replace('/#how', '/'))}
            className="text-sm transition-colors"
            style={{
              color: isActive(link.path) ? palette.primary : palette.textMuted,
            }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
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
        <button
          className="text-sm px-4 py-1.5 rounded-lg font-medium"
          style={{ color: palette.textMuted, border: `1px solid ${palette.border}` }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/marketplace')}
          className="text-sm px-4 py-1.5 rounded-lg font-medium"
          style={{ background: palette.gradient, color: palette.onPrimary }}
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}