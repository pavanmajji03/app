import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import type { Creator } from '../data/mockData';
import {
  TrendingUp, DollarSign, Users, Shield, Brain, Star,
  Youtube, Search, CheckCircle, Heart, ArrowRight, Zap,
  BarChart2, Play, Award, Rocket, Globe, Lock
} from 'lucide-react';

/* ── Scene timing ─────────────────────────────────────────────────── */
const scenes = [
  { id: 'hook', duration: 7000 },
  { id: 'meet-characters', duration: 10000 },
  { id: 'problem', duration: 10000 },
  { id: 'aha-moment', duration: 8000 },
  { id: 'discover', duration: 10000 },
  { id: 'ai-scoring', duration: 12000 },
  { id: 'invest-flow', duration: 10000 },
  { id: 'returns', duration: 10000 },
  { id: 'flywheel', duration: 10000 },
  { id: 'market', duration: 12000 },
  { id: 'traction', duration: 10000 },
  { id: 'the-ask', duration: 11000 },
];
const totalDuration = scenes.reduce((a, s) => a + s.duration, 0);

/* ── SVG Character Components ─────────────────────────────────────── */

function FanCharacter({ x = 0, y = 0, scale = 1, color = '#60A5FA', mood = 'neutral', animate = true }: {
  x?: number; y?: number; scale?: number; color?: string; mood?: string; animate?: boolean;
}) {
  const sk = '#F4C19C';
  const hr = '#3D2714';
  return (
    <motion.g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Ground shadow */}
      <ellipse cx="50" cy="158" rx="22" ry="4" fill="rgba(0,0,0,0.15)" />

      {/* Legs */}
      <rect x="34" y="112" width="13" height="40" rx="6.5" fill="#1e293b" />
      <rect x="53" y="112" width="13" height="40" rx="6.5" fill="#1e293b" />
      {/* Shoes */}
      <ellipse cx="40.5" cy="154" rx="11" ry="6" fill="#0f172a" />
      <ellipse cx="59.5" cy="154" rx="11" ry="6" fill="#0f172a" />
      <ellipse cx="43" cy="151" rx="9" ry="4" fill="#1e293b" />
      <ellipse cx="62" cy="151" rx="9" ry="4" fill="#1e293b" />

      {/* Body (hoodie) */}
      <path d="M24 70 C18 80 16 98 18 115 L82 115 C84 98 82 80 76 70 C68 64 32 64 24 70 Z" fill={color} />
      {/* Pocket */}
      <path d="M37 98 Q50 94 63 98 L62 110 Q50 114 38 110 Z" fill="rgba(0,0,0,0.12)" />
      {/* Shoulder highlight */}
      <ellipse cx="30" cy="72" rx="9" ry="4" fill="rgba(255,255,255,0.2)" transform="rotate(-15,30,72)" />

      {/* Left arm */}
      <path d="M24 72 Q10 88 7 108" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="110" r="7" fill={sk} />

      {/* Right arm + phone */}
      <path d="M76 72 Q90 88 93 105" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="93" cy="107" r="7" fill={sk} />
      {/* Phone */}
      <rect x="89" y="93" width="13" height="22" rx="3" fill="#0f172a" />
      <rect x="90.5" y="95" width="10" height="15" rx="2" fill="#1d4ed8" opacity="0.85" />
      <motion.rect x="90.5" y="95" width="10" height="15" rx="2" fill={color}
        animate={{ opacity: [0.0, 0.4, 0.0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx="95.5" cy="114" r="1.2" fill="#334155" />

      {/* Neck */}
      <rect x="44" y="57" width="12" height="10" rx="5" fill={sk} />

      {/* Head */}
      <circle cx="50" cy="40" r="21" fill={sk} />
      <ellipse cx="43" cy="33" rx="8" ry="6" fill="rgba(255,255,255,0.12)" transform="rotate(-15,43,33)" />

      {/* Ears */}
      <ellipse cx="29" cy="40" rx="4" ry="5.5" fill={sk} />
      <ellipse cx="71" cy="40" rx="4" ry="5.5" fill={sk} />
      <ellipse cx="29" cy="40" rx="2.5" ry="3.5" fill="#e09070" opacity="0.5" />

      {/* Hair */}
      <ellipse cx="50" cy="23" rx="21" ry="14" fill={hr} />
      <path d="M29 34 Q29 20 50 19 Q71 20 71 34" fill={hr} />
      {/* Sideburns */}
      <ellipse cx="30" cy="32" rx="4" ry="6" fill={hr} />
      <ellipse cx="70" cy="32" rx="4" ry="6" fill={hr} />

      {/* Cap */}
      <ellipse cx="50" cy="21" rx="23" ry="8" fill="#0f172a" />
      <path d="M27 22 Q18 24 16 20 Q18 16 27 20 Z" fill="#1e293b" />

      {/* Eyebrows */}
      {mood === 'excited' || mood === 'happy' ? (
        <>
          <path d="M37 31 Q42 28 47 31" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M53 31 Q58 28 63 31" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : mood === 'sad' ? (
        <>
          <path d="M37 31 Q42 33 47 31" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M53 31 Q58 33 63 31" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M37 32 Q42 30 47 32" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M53 32 Q58 30 63 32" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Eyes */}
      {mood === 'excited' ? (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <circle cx="43" cy="39.5" r="3.2" fill="#1a1a2e" />
          <circle cx="57" cy="39.5" r="3.2" fill="#1a1a2e" />
          <circle cx="44.3" cy="38" r="1.3" fill="#fff" />
          <circle cx="58.3" cy="38" r="1.3" fill="#fff" />
        </>
      ) : mood === 'happy' ? (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <path d="M38.5 39 Q43 35 47.5 39" fill="#1a1a2e" />
          <path d="M52.5 39 Q57 35 61.5 39" fill="#1a1a2e" />
        </>
      ) : (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <circle cx="43" cy="39.5" r="3" fill="#333" />
          <circle cx="57" cy="39.5" r="3" fill="#333" />
          <circle cx="44.2" cy="38.2" r="1.1" fill="#fff" />
          <circle cx="58.2" cy="38.2" r="1.1" fill="#fff" />
        </>
      )}

      {/* Nose */}
      <path d="M48 45 Q50 48 52 45" stroke="#c4845c" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      {mood === 'happy' || mood === 'excited' ? (
        <>
          <path d="M40 51 Q50 60 60 51" stroke="#a0522d" strokeWidth="1.8" fill="#e07060" strokeLinecap="round" />
          <ellipse cx="36" cy="46" rx="5" ry="3" fill="#ffb3a7" opacity="0.45" />
          <ellipse cx="64" cy="46" rx="5" ry="3" fill="#ffb3a7" opacity="0.45" />
        </>
      ) : mood === 'sad' ? (
        <path d="M40 53 Q50 47 60 53" stroke="#777" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M41 51 Q50 56 59 51" stroke="#a0522d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
    </motion.g>
  );
}

function CreatorCharacter({ x = 0, y = 0, scale = 1, color = '#F87171', mood = 'neutral', animate = true }: {
  x?: number; y?: number; scale?: number; color?: string; mood?: string; animate?: boolean;
}) {
  const sk = '#D49168';
  const hr = '#1a0800';
  return (
    <motion.g
      transform={`translate(${x}, ${y}) scale(${scale})`}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Ground shadow */}
      <ellipse cx="50" cy="158" rx="22" ry="4" fill="rgba(0,0,0,0.15)" />

      {/* Legs */}
      <rect x="34" y="112" width="13" height="40" rx="6.5" fill="#4a1942" />
      <rect x="53" y="112" width="13" height="40" rx="6.5" fill="#4a1942" />
      {/* Boots */}
      <ellipse cx="40.5" cy="154" rx="11" ry="6" fill="#2d0f26" />
      <ellipse cx="59.5" cy="154" rx="11" ry="6" fill="#2d0f26" />
      <rect x="31" y="143" width="19" height="9" rx="4.5" fill="#3d1535" />
      <rect x="50" y="143" width="19" height="9" rx="4.5" fill="#3d1535" />

      {/* Body */}
      <path d="M24 70 C18 80 16 98 18 115 L82 115 C84 98 82 80 76 70 C68 64 32 64 24 70 Z" fill={color} />
      {/* Top highlight */}
      <ellipse cx="50" cy="72" rx="20" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* REC badge */}
      <rect x="37" y="83" width="26" height="14" rx="7" fill="rgba(0,0,0,0.2)" />
      <motion.circle cx="43" cy="90" r="3"
        fill="#ef4444"
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <text x="49" y="94" fontSize="7" fill="rgba(255,255,255,0.8)" fontWeight="bold">REC</text>

      {/* Left arm */}
      <path d="M24 72 Q10 88 7 108" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="7" cy="110" r="7" fill={sk} />

      {/* Right arm + mic */}
      <path d="M76 72 Q88 86 89 104" stroke={color} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="89" cy="106" r="7" fill={sk} />
      {/* Microphone */}
      <rect x="86" y="82" width="9" height="16" rx="4.5" fill="#475569" />
      <rect x="87" y="83" width="7" height="12" rx="3.5" fill="#64748b" />
      <motion.ellipse cx="90.5" cy="84" rx="5" ry="5.5" fill="none" stroke={color} strokeWidth="1.5"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <rect x="90" y="98" width="1.5" height="8" rx="0.75" fill="#475569" />

      {/* Neck */}
      <rect x="44" y="57" width="12" height="10" rx="5" fill={sk} />

      {/* Head */}
      <circle cx="50" cy="40" r="21" fill={sk} />
      <ellipse cx="43" cy="33" rx="8" ry="6" fill="rgba(255,255,255,0.1)" transform="rotate(-15,43,33)" />

      {/* Ears (under headphones) */}
      <ellipse cx="29" cy="40" rx="4" ry="5.5" fill={sk} />
      <ellipse cx="71" cy="40" rx="4" ry="5.5" fill={sk} />

      {/* Headphone cushions */}
      <ellipse cx="29" cy="40" rx="5.5" ry="7.5" fill="#1e293b" />
      <ellipse cx="71" cy="40" rx="5.5" ry="7.5" fill="#1e293b" />
      <ellipse cx="29" cy="40" rx="4" ry="6" fill="#334155" />
      <ellipse cx="71" cy="40" rx="4" ry="6" fill="#334155" />
      {/* Headphone band */}
      <path d="M29 33 Q50 15 71 33" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M29 33 Q50 17 71 33" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Hair */}
      <ellipse cx="50" cy="22" rx="22" ry="14" fill={hr} />
      <path d="M28 36 Q22 52 25 66" stroke={hr} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M72 36 Q78 52 75 66" stroke={hr} strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Eyebrows */}
      {mood === 'excited' || mood === 'happy' ? (
        <>
          <path d="M37 31 Q42 28 47 31" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M53 31 Q58 28 63 31" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M37 32 Q42 30 47 32" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M53 32 Q58 30 63 32" stroke={hr} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Eyes */}
      {mood === 'excited' ? (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <circle cx="43" cy="39.5" r="3.2" fill="#1a0800" />
          <circle cx="57" cy="39.5" r="3.2" fill="#1a0800" />
          <circle cx="44.3" cy="38" r="1.3" fill="#fff" />
          <circle cx="58.3" cy="38" r="1.3" fill="#fff" />
        </>
      ) : mood === 'happy' ? (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <path d="M38.5 39 Q43 35 47.5 39" fill="#1a0800" />
          <path d="M52.5 39 Q57 35 61.5 39" fill="#1a0800" />
        </>
      ) : (
        <>
          <circle cx="43" cy="39" r="5" fill="#fff" />
          <circle cx="57" cy="39" r="5" fill="#fff" />
          <circle cx="43" cy="39.5" r="3" fill="#1a0800" />
          <circle cx="57" cy="39.5" r="3" fill="#1a0800" />
          <circle cx="44.2" cy="38.2" r="1.1" fill="#fff" />
          <circle cx="58.2" cy="38.2" r="1.1" fill="#fff" />
        </>
      )}

      {/* Nose */}
      <path d="M48 45 Q50 48 52 45" stroke="#b06040" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Mouth */}
      {mood === 'happy' || mood === 'excited' ? (
        <>
          <path d="M40 51 Q50 60 60 51" stroke="#8b3a2a" strokeWidth="1.8" fill="#d06050" strokeLinecap="round" />
          <ellipse cx="36" cy="46" rx="5" ry="3" fill="#ff9988" opacity="0.45" />
          <ellipse cx="64" cy="46" rx="5" ry="3" fill="#ff9988" opacity="0.45" />
        </>
      ) : (
        <path d="M41 51 Q50 56 59 51" stroke="#8b3a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
    </motion.g>
  );
}

function MoneyParticles({ count = 8, spread = 200 }: { count?: number; spread?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.text
          key={i}
          x={Math.random() * spread}
          y={0}
          fontSize="16"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, 30 + Math.random() * 60, 80 + Math.random() * 40, 140],
            x: (Math.random() - 0.5) * 60,
          }}
          transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
        >
          💰
        </motion.text>
      ))}
    </>
  );
}

function FloatingHearts({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [-20, -60 - Math.random() * 40],
            x: (Math.random() - 0.5) * 40,
          }}
          transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, repeatDelay: 2 }}
        >
          <text x={20 + i * 30} y={0} fontSize="14">❤️</text>
        </motion.g>
      ))}
    </>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function CountUp({ target, duration = 2000, prefix = '', suffix = '' }: {
  target: number; duration?: number; prefix?: string; suffix?: string;
}) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

/* ── Scenes ───────────────────────────────────────────────────────── */

function HookScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div className="absolute w-[800px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none" style={{ background: palette.gradient }} />

      <motion.div
        className="text-center relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.p
          className="text-2xl mb-6"
          style={{ color: palette.textMuted }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          What if the next MrBeast...
        </motion.p>

        <motion.h1
          className="text-6xl font-black mb-6"
          style={{ color: palette.text }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          ...was funded by{' '}
          <span style={{ color: palette.accent }}>fans</span>?
        </motion.h1>

        <motion.p
          className="text-xl"
          style={{ color: palette.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          Not VCs. Not brands. Their own audience.
        </motion.p>

        {/* Animated subscriber counter */}
        <motion.div
          className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-xl"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5 }}
        >
          <Youtube size={20} style={{ color: '#FF0000' }} />
          <span className="text-lg font-bold" style={{ color: palette.text }}>
            <CountUp target={50} suffix="M+" /> creators worldwide
          </span>
          <span className="text-lg" style={{ color: palette.textMuted }}>|</span>
          <span className="text-lg font-bold" style={{ color: palette.accent }}>
            $0 from their fans as investors
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MeetCharactersScene() {
  const { palette } = useTheme();
  return (
    <div className="flex items-center justify-center h-full px-16">
      <div className="flex items-center gap-24 w-full max-w-5xl">
        {/* Fan */}
        <motion.div
          className="flex-1 flex flex-col items-center"
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <svg width="160" height="180" viewBox="0 0 100 160">
            <FanCharacter scale={0.9} mood="neutral" animate={false} />
          </svg>
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-2xl font-black" style={{ color: palette.primary }}>Meet Alex</p>
            <p className="text-base mt-1" style={{ color: palette.textMuted }}>The Superfan</p>
            <div className="mt-3 space-y-1.5">
              {['Watches 3hrs/day of creators', 'Bought merch, joined memberships', 'Wants to support creators financially', 'But has NO equity-like upside'].map((t, i) => (
                <motion.p
                  key={t}
                  className="text-sm"
                  style={{ color: palette.textSubtle }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + i * 0.5 }}
                >
                  {t}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* VS */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: palette.gradient }}>
            <Zap size={28} color="#fff" />
          </div>
        </motion.div>

        {/* Creator */}
        <motion.div
          className="flex-1 flex flex-col items-center"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <svg width="160" height="180" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.9} mood="neutral" animate={false} />
          </svg>
          <motion.div
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-2xl font-black" style={{ color: palette.danger }}>Meet Maya</p>
            <p className="text-base mt-1" style={{ color: palette.textMuted }}>The Creator</p>
            <div className="mt-3 space-y-1.5">
              {['2M subscribers, growing fast', 'Makes $4K/month from AdSense', 'Needs $50K for a studio upgrade', 'Banks won\'t lend, VCs want equity'].map((t, i) => (
                <motion.p
                  key={t}
                  className="text-sm"
                  style={{ color: palette.textSubtle }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + i * 0.5 }}
                >
                  {t}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ProblemScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-12"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Today, Fans Can Only <span style={{ color: palette.danger }}>Spend</span>
      </motion.h2>

      <div className="flex gap-6 w-full max-w-5xl">
        {[
          { label: 'Buy Merch', icon: '👕', desc: 'One-time purchase, no returns', loss: '-$40' },
          { label: 'Super Chat', icon: '💬', desc: 'Gone in seconds, zero upside', loss: '-$10' },
          { label: 'Membership', icon: '🎫', desc: 'Monthly drain, creator keeps 70%', loss: '-$5/mo' },
          { label: 'Donate', icon: '🎁', desc: 'Pure charity, fan gets nothing back', loss: '-$$$' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            className="flex-1 rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.8 }}
          >
            <p className="text-4xl mb-3">{item.icon}</p>
            <p className="font-bold text-base mb-1" style={{ color: palette.text }}>{item.label}</p>
            <p className="text-xs mb-3" style={{ color: palette.textMuted }}>{item.desc}</p>
            <motion.p
              className="text-lg font-black"
              style={{ color: palette.danger }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + i * 0.8 }}
            >
              {item.loss}
            </motion.p>
            {/* Red X overlay */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              transition={{ delay: 1.5 + i * 0.8 }}
            >
              <p className="text-[100px] font-black" style={{ color: palette.danger }}>X</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-xl font-bold text-center mt-10"
        style={{ color: palette.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }}
      >
        Fans spend billions — but never earn a dollar back.
      </motion.p>
    </div>
  );
}

function AhaMomentScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="absolute w-[600px] h-[400px] rounded-full blur-[120px] opacity-25 pointer-events-none" style={{ background: palette.accentGradient }} />

      <motion.div className="relative text-center">
        <motion.p
          className="text-2xl mb-4"
          style={{ color: palette.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          What if fans could...
        </motion.p>

        <motion.h1
          className="text-6xl font-black mb-8"
          style={{ color: palette.text }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8, type: 'spring' }}
        >
          <span style={{ color: palette.accent }}>Invest</span> instead of just spend?
        </motion.h1>

        {/* Characters coming together */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <svg width="100" height="120" viewBox="0 0 100 160">
            <FanCharacter scale={0.6} mood="excited" animate={false} />
          </svg>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3.5, type: 'spring' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: palette.gradient }}>
              <TrendingUp size={24} color="#fff" />
            </div>
            <span className="text-xl font-black" style={{ color: palette.text }}>
              Fan<span style={{ color: palette.accent }}>Z</span><span style={{ color: palette.primary }}>Folio</span>
            </span>
          </motion.div>

          <svg width="100" height="120" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.6} mood="excited" animate={false} />
          </svg>
        </motion.div>

        <motion.p
          className="text-lg mt-6"
          style={{ color: palette.primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5 }}
        >
          The platform that turns fan loyalty into financial returns.
        </motion.p>
      </motion.div>
    </div>
  );
}

function DiscoverScene({ creators }: { creators: Creator[] }) {
  const { palette } = useTheme();
  const featured = creators.slice(0, 3);
  const riskColors: Record<string, string> = { Low: palette.success, 'Low-Med': '#84CC16', Medium: palette.warning, High: palette.danger };

  return (
    <div className="flex items-center justify-center h-full px-12">
      <div className="flex gap-10 w-full max-w-6xl items-center">
        {/* Left: Fan character browsing */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg width="140" height="160" viewBox="0 0 100 160">
            <FanCharacter scale={0.85} mood="excited" animate={false} />
          </svg>
          <motion.div
            className="mt-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}`, color: palette.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Alex browses the marketplace...
          </motion.div>
        </motion.div>

        {/* Right: Marketplace cards */}
        <motion.div
          className="flex-1 rounded-2xl overflow-hidden"
          style={{ border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: palette.surfaceAlt }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            </div>
            <div className="flex-1 text-center text-xs" style={{ color: palette.textSubtle }}>fanzfolio.io/marketplace</div>
          </div>

          <div className="p-5 grid grid-cols-3 gap-3" style={{ backgroundColor: palette.bg }}>
            {featured.map((c, i) => {
              const pct = Math.round((c.raisedAmount / c.targetAmount) * 100);
              return (
                <motion.div
                  key={c.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: palette.surface,
                    border: `1px solid ${i === 0 ? palette.primary : palette.border}`,
                    boxShadow: i === 0 ? `0 0 20px ${palette.primary}30` : 'none',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 + i * 0.8 }}
                >
                  <div className="relative h-24 overflow-hidden">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${palette.surface} 0%, transparent 60%)` }} />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-xs" style={{ color: palette.text }}>{c.name}</h4>
                      <motion.div
                        className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: c.aiScore >= 80 ? `${palette.success}22` : `${palette.warning}22`,
                          color: c.aiScore >= 80 ? palette.success : palette.warning,
                        }}
                        animate={i === 0 ? { boxShadow: [`0 0 5px ${palette.success}20`, `0 0 15px ${palette.success}50`, `0 0 5px ${palette.success}20`] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Star size={8} /> {c.aiScore}
                      </motion.div>
                    </div>
                    <p className="text-[9px] mb-2" style={{ color: palette.textMuted }}>{c.subscribers} subs</p>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: palette.gradient }} />
                    </div>
                    <p className="text-[9px] mt-1.5" style={{ color: palette.success }}>+{c.returnBase}% projected return</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Cursor clicking on first card */}
          <motion.div
            className="absolute"
            style={{ bottom: '40%', left: '38%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.5], scale: [1, 1, 0.9, 1] }}
            transition={{ delay: 5, duration: 1.5 }}
          >
            <div className="w-5 h-5 border-2 border-white rounded-full" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function AIScoringScene() {
  const { palette } = useTheme();
  const categories = [
    { label: 'Growth', value: 85, icon: TrendingUp },
    { label: 'Engagement', value: 78, icon: Heart },
    { label: 'Monetization', value: 72, icon: DollarSign },
    { label: 'Consistency', value: 90, icon: Play },
    { label: 'Trend Alignment', value: 68, icon: Search },
    { label: 'Platform Risk', value: 82, icon: Shield },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-3xl font-black text-center mb-3"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        AI Underwrites Every Creator
      </motion.h2>
      <motion.p
        className="text-base text-center mb-8"
        style={{ color: palette.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Real data. Fixed rules. AI adjusts by max 20 points. No guessing.
      </motion.p>

      <div className="flex gap-8 w-full max-w-5xl items-start">
        {/* Left: Creator being scanned */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <svg width="140" height="170" viewBox="0 0 100 160">
              <CreatorCharacter scale={0.85} mood="happy" animate={false} />
            </svg>
            {/* Scanning beam */}
            <motion.div
              className="absolute left-0 right-0 h-1 rounded-full"
              style={{ background: palette.gradient }}
              initial={{ top: 0, opacity: 0 }}
              animate={{ top: ['0%', '100%', '0%'], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="text-sm font-bold mt-2" style={{ color: palette.text }}>Maya's Channel</p>
          <p className="text-xs" style={{ color: palette.textMuted }}>2M subs | 520K avg views</p>
        </motion.div>

        {/* Right: Score breakdown */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              const color = cat.value >= 80 ? palette.success : cat.value >= 65 ? palette.warning : palette.danger;
              return (
                <motion.div
                  key={cat.label}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: palette.primary }} />
                    <span className="text-xs font-medium" style={{ color: palette.textMuted }}>{cat.label}</span>
                  </div>
                  <motion.p
                    className="text-3xl font-black"
                    style={{ color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.6 }}
                  >
                    {cat.value}
                  </motion.p>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ delay: 1.5 + i * 0.6, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Overall score */}
          <motion.div
            className="mt-4 rounded-xl p-4 flex items-center justify-between"
            style={{ background: `${palette.primary}15`, border: `1px solid ${palette.primary}40` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5.5 }}
          >
            <div className="flex items-center gap-3">
              <Brain size={24} style={{ color: palette.primary }} />
              <div>
                <p className="text-sm font-bold" style={{ color: palette.text }}>AI Investability Score</p>
                <p className="text-xs" style={{ color: palette.textMuted }}>Based on 2,400+ data points</p>
              </div>
            </div>
            <motion.p
              className="text-4xl font-black"
              style={{ color: palette.success }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ delay: 6, duration: 0.5 }}
            >
              74/100
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InvestFlowScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-3xl font-black text-center mb-10"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Alex Invests in Maya's Channel
      </motion.h2>

      <div className="flex items-center gap-6 w-full max-w-5xl">
        {/* Fan */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg width="120" height="140" viewBox="0 0 100 160">
            <FanCharacter scale={0.75} mood="excited" animate={false} />
          </svg>
          <p className="text-sm font-bold mt-1" style={{ color: palette.primary }}>Alex</p>
        </motion.div>

        {/* Investment flow */}
        <motion.div
          className="flex-1 flex flex-col gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[
            { step: '1', label: 'Selects Maya\'s campaign', detail: 'AI Score: 74 | Low-Med Risk', icon: Search, delay: 1.5 },
            { step: '2', label: 'Simulates returns', detail: '$500 invested → $560-$605 projected (12mo)', icon: BarChart2, delay: 3 },
            { step: '3', label: 'Invests $500', detail: '5% revenue share for 12 months', icon: DollarSign, delay: 4.5 },
            { step: '4', label: 'Gets monthly payouts', detail: 'Based on actual YouTube performance', icon: CheckCircle, delay: 6 },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                className="flex items-center gap-4 rounded-xl p-4"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: s.delay }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${palette.primary}22` }}>
                  <Icon size={18} style={{ color: palette.primary }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: palette.text }}>{s.label}</p>
                  <p className="text-xs" style={{ color: palette.textMuted }}>{s.detail}</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: s.delay + 0.5, type: 'spring' }}
                >
                  <CheckCircle size={18} style={{ color: palette.success }} />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Creator */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <svg width="120" height="140" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.75} mood="happy" animate={false} />
          </svg>
          <p className="text-sm font-bold mt-1" style={{ color: palette.danger }}>Maya</p>
          <motion.p
            className="text-xs mt-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: `${palette.success}22`, color: palette.success }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 7 }}
          >
            +$500 funded!
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function ReturnsScene() {
  const { palette } = useTheme();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = [500, 506, 512, 520, 530, 542];
  const barHeights = [40, 52, 60, 70, 82, 95];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-3xl font-black text-center mb-8"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Alex Earns <span style={{ color: palette.success }}>Real Returns</span>
      </motion.h2>

      <div className="flex gap-8 w-full max-w-5xl">
        {/* Portfolio growth chart */}
        <motion.div
          className="flex-1 rounded-2xl p-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-bold mb-3" style={{ color: palette.text }}>Portfolio Growth</p>
          <div className="flex items-end gap-3" style={{ height: 180 }}>
            {months.map((m, i) => {
              const h = barHeights[i];
              return (
                <motion.div
                  key={m}
                  className="flex-1 flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.5 }}
                >
                  <motion.p
                    className="text-xs font-bold mb-1"
                    style={{ color: palette.success }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 + i * 0.5 }}
                  >
                    ${values[i]}
                  </motion.p>
                  <motion.div
                    className="w-full rounded-t-lg"
                    style={{ background: palette.gradient }}
                    initial={{ height: 0 }}
                    animate={{ height: h * 1.6 }}
                    transition={{ delay: 1 + i * 0.5, duration: 0.6, ease: 'easeOut' }}
                  />
                </motion.div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-1">
            {months.map((m) => (
              <p key={m} className="flex-1 text-xs text-center" style={{ color: palette.textSubtle }}>{m}</p>
            ))}
          </div>
          <motion.p
            className="text-xs text-center mt-2"
            style={{ color: palette.success }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5 }}
          >
            +8.4% return in 6 months
          </motion.p>
        </motion.div>

        {/* Statement snapshot */}
        <motion.div
          className="flex-1 rounded-2xl p-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <p className="text-sm font-bold mb-4" style={{ color: palette.text }}>Monthly Statement</p>
          {[
            { label: 'Creator', value: 'Maya (TechVault)', color: palette.text },
            { label: 'Your Investment', value: '$500', color: palette.text },
            { label: 'Maya\'s Views (Feb)', value: '58.2M', color: palette.primary },
            { label: 'Revenue Generated', value: '$244,440', color: palette.text },
            { label: 'Your Share (5%)', value: '$6.22', color: palette.success },
            { label: 'Total Earned to Date', value: '$12.22', color: palette.success },
          ].map((row, i) => (
            <motion.div
              key={row.label}
              className="flex justify-between py-1.5"
              style={{ borderBottom: i < 5 ? `1px solid ${palette.border}40` : 'none' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.5 + i * 0.4 }}
            >
              <span className="text-xs" style={{ color: palette.textMuted }}>{row.label}</span>
              <span className="text-xs font-bold" style={{ color: row.color }}>{row.value}</span>
            </motion.div>
          ))}

          <motion.div
            className="mt-4 flex items-center justify-center gap-2 py-2 rounded-lg"
            style={{ backgroundColor: `${palette.success}15` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5.5 }}
          >
            <CheckCircle size={14} style={{ color: palette.success }} />
            <span className="text-xs font-bold" style={{ color: palette.success }}>94% Forecast Accuracy</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function FlywheelScene() {
  const { palette } = useTheme();
  const steps = [
    { label: 'Fans Invest', icon: Users, desc: 'Fans back creators they believe in', color: palette.primary },
    { label: 'Creator Gets Funded', icon: DollarSign, desc: 'Upfront capital for content & growth', color: palette.accent },
    { label: 'Better Content', icon: Play, desc: 'Higher production, more uploads', color: palette.success },
    { label: 'More Views & Revenue', icon: TrendingUp, desc: 'Channel grows, ad revenue climbs', color: '#F87171' },
    { label: 'Fans Earn Returns', icon: Award, desc: 'Performance-linked payouts monthly', color: palette.primary },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-3xl font-black text-center mb-4"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        The <span style={{ color: palette.accent }}>FanZFolio</span> Flywheel
      </motion.h2>
      <motion.p
        className="text-base text-center mb-10"
        style={{ color: palette.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A self-reinforcing cycle where everyone wins.
      </motion.p>

      {/* Circular flywheel */}
      <div className="relative w-[500px] h-[500px]">
        {/* Center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center z-10"
          style={{ background: palette.gradient }}
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ delay: 0.5, duration: 1, type: 'spring' }}
        >
          <Rocket size={32} color="#fff" />
        </motion.div>

        {/* Connecting circle */}
        <motion.div
          className="absolute inset-12 rounded-full"
          style={{ border: `2px dashed ${palette.border}` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8 }}
        />

        {/* Nodes positioned in a circle */}
        {steps.map((step, i) => {
          const angle = (i * 360) / steps.length - 90;
          const rad = (angle * Math.PI) / 180;
          const radius = 200;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.label}
              className="absolute flex flex-col items-center w-32"
              style={{ left: `calc(50% + ${x}px - 64px)`, top: `calc(50% + ${y}px - 40px)` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 1.2, type: 'spring' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: `${step.color}22`, border: `1px solid ${step.color}40` }}
              >
                <Icon size={20} style={{ color: step.color }} />
              </div>
              <p className="text-xs font-bold text-center" style={{ color: palette.text }}>{step.label}</p>
              <p className="text-[9px] text-center mt-0.5" style={{ color: palette.textMuted }}>{step.desc}</p>
            </motion.div>
          );
        })}

        {/* Arrows between nodes */}
        {steps.map((_, i) => {
          const angle = (i * 360) / steps.length - 90 + 360 / steps.length / 2;
          const rad = (angle * Math.PI) / 180;
          const r = 160;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <motion.div
              key={`arrow-${i}`}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 8px)`,
                top: `calc(50% + ${y}px - 8px)`,
                transform: `rotate(${angle + 90}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 2 + i * 1.2 }}
            >
              <ArrowRight size={16} style={{ color: palette.primary }} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MarketScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span style={{ background: palette.accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          A $250B Opportunity
        </span>
      </motion.h2>
      <motion.p
        className="text-base text-center mb-10"
        style={{ color: palette.textMuted }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        The creator economy is exploding — and completely underserved by finance.
      </motion.p>

      <div className="grid grid-cols-2 gap-5 w-full max-w-4xl">
        {[
          { value: '$250B+', label: 'Creator economy by 2027', source: 'Goldman Sachs', icon: Globe, delay: 1 },
          { value: '50M+', label: 'Content creators worldwide', source: 'SignalFire', icon: Users, delay: 2.5 },
          { value: '67%', label: 'Want alternative funding beyond ads', source: 'Linktree Creator Report', icon: DollarSign, delay: 4 },
          { value: 'Only 4%', label: 'Of creators earn over $100K/year', source: 'Linktree', icon: Lock, delay: 5.5 },
          { value: '$1.3B+', label: 'Raised in creator startups in 2024', source: 'Crunchbase', icon: Rocket, delay: 7 },
          { value: '2B+', label: 'Daily YouTube active users', source: 'YouTube', icon: Youtube, delay: 8.5 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="flex items-center gap-4 rounded-xl p-5"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: stat.delay, duration: 0.4 }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${palette.primary}22` }}>
                <Icon size={22} style={{ color: palette.primary }} />
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: palette.accent }}>{stat.value}</p>
                <p className="text-sm" style={{ color: palette.text }}>{stat.label}</p>
                <p className="text-[10px]" style={{ color: palette.textSubtle }}>Source: {stat.source}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TractionScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full px-16">
      <motion.h2
        className="text-4xl font-black text-center mb-10"
        style={{ color: palette.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Early Traction
      </motion.h2>

      <div className="grid grid-cols-4 gap-5 w-full max-w-4xl mb-10">
        {[
          { value: 142, suffix: '', label: 'Creators Onboarded', color: palette.primary },
          { value: 3800, suffix: '+', label: 'Fan Investors', color: palette.accent },
          { value: 2.4, suffix: 'M', label: 'Paper Investments', color: palette.success, prefix: '$' },
          { value: 94, suffix: '%', label: 'Forecast Accuracy', color: palette.primaryLight },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className="rounded-xl p-6 text-center"
            style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.8 }}
          >
            <p className="text-4xl font-black" style={{ color: m.color }}>
              <CountUp target={m.value} prefix={m.prefix || ''} suffix={m.suffix} />
            </p>
            <p className="text-xs mt-2" style={{ color: palette.textMuted }}>{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Competitive edge */}
      <motion.div
        className="w-full max-w-4xl rounded-xl p-6"
        style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
      >
        <p className="text-sm font-bold mb-4" style={{ color: palette.text }}>Why Us?</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'No competition', desc: 'No platform lets fans invest in creators with AI-backed underwriting' },
            { title: 'AI-first, not AI-washed', desc: 'Scores from real data with fixed rules — AI refines, never fabricates' },
            { title: 'Revenue model clarity', desc: 'Platform fee on transactions + premium analytics for creators' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              className="flex items-start gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 5 + i * 0.6 }}
            >
              <CheckCircle size={16} style={{ color: palette.success, marginTop: 2, flexShrink: 0 }} />
              <div>
                <p className="text-xs font-bold" style={{ color: palette.text }}>{item.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: palette.textMuted }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function TheAskScene() {
  const { palette } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="absolute w-[800px] h-[600px] rounded-full blur-[160px] opacity-20 pointer-events-none" style={{ background: palette.gradient }} />

      <motion.div className="relative text-center max-w-3xl">
        {/* Characters celebrating */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg width="80" height="100" viewBox="0 0 100 160">
            <FanCharacter scale={0.55} mood="excited" animate={false} />
          </svg>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: palette.gradient }}>
              <TrendingUp size={24} color="#fff" />
            </div>
            <span className="text-4xl font-black" style={{ color: palette.text }}>
              Fan<span style={{ color: palette.accent }}>Z</span><span style={{ color: palette.primary }}>Folio</span>
            </span>
          </div>

          <svg width="80" height="100" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.55} mood="excited" animate={false} />
          </svg>
        </motion.div>

        <motion.h1
          className="text-5xl font-black mb-4"
          style={{ color: palette.text }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Join Us in Building the{' '}
          <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Future of Creator Finance
          </span>
        </motion.h1>

        <motion.p
          className="text-xl mb-10"
          style={{ color: palette.textMuted }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          We're raising to scale AI underwriting, onboard 10,000 creators, and launch real transactions.
        </motion.p>

        {/* What we're building */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 }}
        >
          {[
            { icon: Brain, label: 'Scale AI Engine', desc: 'Multi-platform data ingestion' },
            { icon: Users, label: '10K Creators', desc: 'Onboard & underwrite at scale' },
            { icon: DollarSign, label: 'Real Transactions', desc: 'Regulatory-compliant investing' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${palette.primary}22` }}>
                  <Icon size={18} style={{ color: palette.primary }} />
                </div>
                <p className="text-sm font-bold" style={{ color: palette.text }}>{item.label}</p>
                <p className="text-[10px]" style={{ color: palette.textMuted }}>{item.desc}</p>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
        >
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm" style={{ color: palette.textMuted }}>AI-First</p>
            <Brain size={20} style={{ color: palette.primary }} />
          </div>
          <div className="w-px h-8" style={{ backgroundColor: palette.border }} />
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm" style={{ color: palette.textMuted }}>Transparent</p>
            <Shield size={20} style={{ color: palette.primary }} />
          </div>
          <div className="w-px h-8" style={{ backgroundColor: palette.border }} />
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm" style={{ color: palette.textMuted }}>Fan-Powered</p>
            <Users size={20} style={{ color: palette.primary }} />
          </div>
        </motion.div>

        <motion.p
          className="text-lg mt-8"
          style={{ color: palette.textSubtle }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 7 }}
        >
          Let's talk.
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

export function PitchV3() {
  const { palette, setPalette } = useTheme();
  const [currentScene, setCurrentScene] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [creators, setCreators] = useState<Creator[]>([]);

  useEffect(() => { setPalette('midnight'); }, [setPalette]);

  useEffect(() => {
    callApi<Creator[]>('getCreators_PitchV3').then(res => setCreators(res.data));
  }, []);

  useEffect(() => {
    if (paused || currentScene >= scenes.length) return;
    const timeout = window.setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        elapsedRef.current += scenes[currentScene].duration;
        setElapsed(elapsedRef.current);
        setCurrentScene((p) => p + 1);
      } else {
        elapsedRef.current = totalDuration;
        setElapsed(totalDuration);
      }
    }, scenes[currentScene].duration);
    return () => clearTimeout(timeout);
  }, [currentScene, paused]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') { e.preventDefault(); setPaused((p) => !p); }
    else if (e.code === 'ArrowRight' && currentScene < scenes.length - 1) {
      elapsedRef.current += scenes[currentScene].duration;
      setElapsed(elapsedRef.current);
      setCurrentScene((p) => p + 1);
    } else if (e.code === 'ArrowLeft' && currentScene > 0) {
      elapsedRef.current -= scenes[currentScene - 1].duration;
      setElapsed(elapsedRef.current);
      setCurrentScene((p) => p - 1);
    }
  }, [currentScene]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderScene = () => {
    switch (scenes[currentScene]?.id) {
      case 'hook': return <HookScene />;
      case 'meet-characters': return <MeetCharactersScene />;
      case 'problem': return <ProblemScene />;
      case 'aha-moment': return <AhaMomentScene />;
      case 'discover': return <DiscoverScene creators={creators} />;
      case 'ai-scoring': return <AIScoringScene />;
      case 'invest-flow': return <InvestFlowScene />;
      case 'returns': return <ReturnsScene />;
      case 'flywheel': return <FlywheelScene />;
      case 'market': return <MarketScene />;
      case 'traction': return <TractionScene />;
      case 'the-ask': return <TheAskScene />;
      default: return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{ backgroundColor: palette.bg }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={scenes[currentScene]?.id}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {renderScene()}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: `${palette.border}40` }}>
        <motion.div className="h-full" style={{ background: palette.gradient }} animate={{ width: `${(elapsed / totalDuration) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {paused && (
        <div className="absolute top-6 right-6 text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${palette.warning}22`, color: palette.warning }}>
          PAUSED — Press Space
        </div>
      )}

      <div className="absolute bottom-4 right-4 text-[10px]" style={{ color: palette.textSubtle }}>
        {currentScene + 1} / {scenes.length}
      </div>
    </div>
  );
}