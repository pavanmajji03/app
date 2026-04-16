import { useTheme } from '../context/ThemeContext';
import { Globe } from 'lucide-react';

// import { useState, useRef, useEffect } from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// function LinkedInIcon({ size = 14, color }: { size?: number; color: string }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
//       <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//     </svg>
//   );
// }

// function XIcon({ size = 14, color }: { size?: number; color: string }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
//       <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
//     </svg>
//   );
// }

// const team = [
//   {
//     name: 'Arjun Sharma',
//     role: 'Co-founder & CEO',
//     avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ArjunSharma&backgroundColor=b6e3f4',
//     bio: 'Former fintech PM at Razorpay. Obsessed with creator economics and the future of audience-owned media. Built FanZFolio to give creators a better fundraising alternative than brand deals.',
//     tags: ['Fintech', 'Product', 'Strategy'],
//     socials: { linkedin: '#', twitter: '#' },
//   },
//   {
//     name: 'Priya Nair',
//     role: 'Co-founder & CTO',
//     avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=PriyaNair&backgroundColor=ffdfbf',
//     bio: 'Ex-ML engineer at Google DeepMind. Leads the AI underwriting engine that scores creator channels across 2,900+ signals. Believer in open infrastructure for the creator economy.',
//     tags: ['AI/ML', 'Engineering', 'Architecture'],
//     socials: { linkedin: '#', twitter: '#' },
//   },
//   {
//     name: 'Rohan Mehta',
//     role: 'Head of Growth',
//     avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=RohanMehta&backgroundColor=c0aede',
//     bio: 'Scaled 3 D2C brands from 0 to $10M ARR. Brings creator-first GTM thinking to FanZFolio — focused on building a marketplace creators actually trust and fans love investing in.',
//     tags: ['Growth', 'Marketing', 'GTM'],
//     socials: { linkedin: '#', twitter: '#' },
//   },
//   {
//     name: 'Kavya Reddy',
//     role: 'Head of Creator Partnerships',
//     avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=KavyaReddy&backgroundColor=d1f4d1',
//     bio: 'Former talent manager at a top MCN, worked with 200+ creators. Bridges the gap between the platform and real creator needs — making sure FanZFolio works for every niche.',
//     tags: ['Partnerships', 'Creator Relations', 'Content'],
//     socials: { linkedin: '#', twitter: '#' },
//   },
//   {
//     name: 'Siddharth Kulkarni',
//     role: 'Lead Data Scientist',
//     avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=SiddharthK&backgroundColor=ffd5dc',
//     bio: 'PhD in computational statistics from IISc. Designed the view-forecast and revenue-scenario models powering our AI reports. Turns raw YouTube signals into actionable investor intelligence.',
//     tags: ['Data Science', 'Forecasting', 'Research'],
//     socials: { linkedin: '#' },
//   },
// ];

// function TeamCard({ member }: { member: typeof team[0] }) {
//   const { palette } = useTheme();
//   return (
//     <div
//       className="rounded-2xl p-5 flex flex-col h-full"
//       style={{
//         backgroundColor: palette.surface,
//         border: `1px solid ${palette.border}`,
//         minWidth: 260,
//         maxWidth: 300,
//       }}
//     >
//       <div className="flex items-center gap-3 mb-4">
//         <div
//           className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
//           style={{ border: `2px solid ${palette.primary}40`, backgroundColor: palette.surfaceAlt }}
//         >
//           <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
//         </div>
//         <div>
//           <p className="font-bold text-sm" style={{ color: palette.text }}>{member.name}</p>
//           <p
//             className="text-xs font-medium mt-0.5 px-2 py-0.5 rounded-full w-fit"
//             style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
//           >
//             {member.role}
//           </p>
//         </div>
//       </div>
//       <p className="text-xs leading-relaxed flex-1" style={{ color: palette.textMuted }}>{member.bio}</p>
//       <div className="flex flex-wrap gap-1.5 mt-4">
//         {member.tags.map(tag => (
//           <span
//             key={tag}
//             className="text-xs px-2 py-0.5 rounded-full"
//             style={{ backgroundColor: `${palette.accent}14`, color: palette.textMuted, border: `1px solid ${palette.accent}25` }}
//           >
//             {tag}
//           </span>
//         ))}
//       </div>
//       <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
//         {member.socials.linkedin && (
//           <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer"
//             className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
//             style={{ backgroundColor: `${palette.primary}14`, color: palette.textMuted }}
//             onMouseEnter={e => (e.currentTarget.style.color = palette.primary)}
//             onMouseLeave={e => (e.currentTarget.style.color = palette.textMuted)}
//           >
//             <LinkedInIcon size={13} color="currentColor" />
//           </a>
//         )}
//         {member.socials.twitter && (
//           <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer"
//             className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
//             style={{ backgroundColor: `${palette.primary}14`, color: palette.textMuted }}
//             onMouseEnter={e => (e.currentTarget.style.color = palette.primary)}
//             onMouseLeave={e => (e.currentTarget.style.color = palette.textMuted)}
//           >
//             <XIcon size={13} color="currentColor" />
//           </a>
//         )}
//       </div>
//     </div>
//   );
// }

export function AboutUs() {
  const { palette } = useTheme();

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: `${palette.primary}18`, color: palette.primary }}
          >
            <Globe size={11} /> Our Story
          </div>
          <h1 className="text-4xl font-black mb-4" style={{ color: palette.text }}>
            We believe creators deserve<br />
            <span className="block" style={{ background: palette.accentGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              better funding options.
            </span>
          </h1>
          <p className="text-base max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: palette.textMuted }}>
            FanZFolio was born from two ideas that collided.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
              <div className="text-2xl mb-3">😤</div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: palette.text }}>Creators deserve better</h3>
              <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>
                Great creators were being forced into bad brand deals just to fund their next video. Their independence was the price of growth. We wanted to fix that.
              </p>
            </div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>
              <div className="text-2xl mb-3">🚀</div>
              <h3 className="font-bold mb-2 text-sm" style={{ color: palette.text }}>Fans should grow with creators</h3>
              <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>
                If you can see a creator is growing and doing great work — why not back them and grow along with them? Fans have conviction. They just never had a way to act on it.
              </p>
            </div>
          </div>
        </div>

        {/* Mission cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: '🎯', title: 'Our Mission', body: 'Democratize creator funding by giving any fan the ability to back the creators they believe in — and share in the upside.' },
            { icon: '🤖', title: 'AI-First Underwriting', body: 'We analyze 2,900+ signals per channel to produce institutional-grade risk assessments that protect both creators and investors.' },
            { icon: '🔒', title: 'Simulation Safe', body: 'No real money changes hands. FanZFolio is a simulation platform — the perfect way to explore creator investing without risk.' },
          ].map(c => (
            <div
              key={c.title}
              className="rounded-2xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <div className="text-2xl mb-3">{c.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: palette.text }}>{c.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: palette.textMuted }}>{c.body}</p>
            </div>
          ))}
        </div>

        {/* Meet the Team — coming soon */}
        {/* TODO: Add team section once team details are ready */}

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
          <div className="relative">
            <h3 className="text-2xl font-black mb-2" style={{ color: palette.onPrimary }}>Want to join us?</h3>
            <p className="text-sm mb-5" style={{ color: `${palette.onPrimary}cc` }}>
              We're a small team with big ambitions. If you care about creator economics, reach out.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:fanzfolioapp@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: `${palette.onPrimary}18`, color: palette.onPrimary, border: `1px solid ${palette.onPrimary}40` }}
              >
                fanzfolioapp@gmail.com
              </a>
              <a
                href="https://youtube.com/@fanzfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ backgroundColor: `${palette.onPrimary}18`, color: palette.onPrimary, border: `1px solid ${palette.onPrimary}40` }}
              >
                YouTube: @fanzfolio
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
