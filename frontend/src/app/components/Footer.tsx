import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { TrendingUp, Mail } from 'lucide-react';

function YoutubeIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill={color} />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  );
}

function XIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

const socialLinks = [
  {
    label: 'Email',
    href: 'mailto:fanzfolioapp@gmail.com',
    icon: (color: string) => <Mail size={16} color={color} />,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@FanZFolio',
    icon: (color: string) => <YoutubeIcon size={16} color={color} />,
  },
  {
    label: 'X',
    href: 'https://x.com/FanZFolio',
    icon: (color: string) => <XIcon size={16} color={color} />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/fanzfolio',
    icon: (color: string) => <LinkedInIcon size={16} color={color} />,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/fanzfolio',
    icon: (color: string) => <InstagramIcon size={16} color={color} />,
  },
];

const footerLinks = [
  { label: 'Marketplace', to: '/marketplace' },
  { label: 'List Your Channel', to: '/onboard' },
  { label: 'About Us', to: '/about' },
];

export function Footer() {
  const { palette } = useTheme();
  const navigate = useNavigate();

  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: palette.surface,
        borderTop: `1px solid ${palette.border}`,
        paddingBottom: '3.5rem', // clear PrototypeBar
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 w-fit">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: palette.gradient }}
              >
                <TrendingUp size={15} color={palette.onPrimary} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: palette.text }}>
                Fan<span style={{ color: palette.accent }}>Z</span>
                <span style={{ color: palette.primary }}>Folio</span>
              </span>
            </button>
            <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>
              The first fan-powered funding platform connecting creators with their most passionate supporters through AI-driven underwriting.
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wider mb-1" style={{ color: palette.textSubtle }}>PLATFORM</p>
            {footerLinks.map(link => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="text-sm text-left transition-colors w-fit"
                style={{ color: palette.textMuted }}
                onMouseEnter={e => (e.currentTarget.style.color = palette.primary)}
                onMouseLeave={e => (e.currentTarget.style.color = palette.textMuted)}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Social */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-wider" style={{ color: palette.textSubtle }}>FIND US</p>
            <div className="flex items-center gap-2">
              {socialLinks.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: `${palette.primary}12`,
                    border: `1px solid ${palette.border}`,
                    color: palette.textMuted,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${palette.primary}28`;
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = palette.primary;
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${palette.primary}12`;
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = palette.border;
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                  }}
                >
                  {s.icon(palette.textMuted)}
                </a>
              ))}
            </div>
            <p className="text-xs" style={{ color: palette.textSubtle }}>
              fanzfolioapp@gmail.com
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 pt-6"
          style={{ borderTop: `1px solid ${palette.border}` }}
        >
          <p className="text-xs" style={{ color: palette.textSubtle }}>
            © {new Date().getFullYear()} FanZFolio. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: palette.textSubtle }}>
            Simulation only · No real financial transactions
          </p>
        </div>
      </div>
    </footer>
  );
}
