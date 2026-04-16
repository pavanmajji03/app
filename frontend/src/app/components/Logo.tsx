import { useTheme } from '../context/ThemeContext';

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  const { palette } = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={palette.primary} />
          <stop offset="100%" stopColor={palette.primaryDark} />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#logoBg)" />
      <line x1="140" y1="150" x2="372" y2="150" stroke={palette.accent} strokeWidth="40" strokeLinecap="round" />
      <line x1="372" y1="150" x2="140" y2="362" stroke="#FFFFFF" strokeWidth="40" strokeLinecap="round" />
      <line x1="140" y1="362" x2="372" y2="362" stroke={palette.accent} strokeWidth="40" strokeLinecap="round" />
      <polyline points="340,120 372,90 404,120" stroke={palette.accent} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

interface LogoTextProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const textSizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
  xl: 'text-5xl',
};

const iconSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 56,
};

export function LogoFull({ size = 'md', className }: LogoTextProps) {
  const { palette } = useTheme();
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <LogoIcon size={iconSizes[size]} />
      <span className={`font-black tracking-tight ${textSizes[size]}`} style={{ color: palette.text }}>
        Fan<span style={{ color: palette.accent }}>Z</span><span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Folio</span>
      </span>
    </div>
  );
}
