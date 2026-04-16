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
// const scenes = [
//   { id: 'hook', duration: 7000 },
//   { id: 'meet-characters', duration: 10000 },
//   { id: 'problem', duration: 10000 },
//   { id: 'aha-moment', duration: 8000 },
//   { id: 'discover', duration: 10000 },
//   { id: 'ai-scoring', duration: 12000 },
//   { id: 'invest-flow', duration: 10000 },
//   { id: 'returns', duration: 10000 },
//   { id: 'flywheel', duration: 10000 },
//   { id: 'market', duration: 12000 },
//   { id: 'traction', duration: 10000 },
//   { id: 'the-ask', duration: 11000 },
// ];
const scenes = [
  { id: 'hook', duration: 100 },
  { id: 'ai-scoring', duration: 100 },
  { id: 'flywheel', duration: 100 },
  { id: 'the-ask', duration: 100 },
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

/* ── Meet-scene Illustrations ────────────────────────────────────── */

const FAN_EMOJIS = [
  { emoji: '❤️', x: 142, delay: 0.4 },
  { emoji: '😂', x: 160, delay: 1.1 },
  { emoji: '😢', x: 178, delay: 1.9 },
  { emoji: '😮', x: 149, delay: 2.7 },
  { emoji: '👍', x: 167, delay: 3.5 },
  { emoji: '🔥', x: 155, delay: 4.3 },
];

function FanSittingScene() {
  const sk = '#F4C19C', hr = '#3D2714';
  return (
    <svg width="280" height="196" viewBox="0 0 220 175">
      {/* Couch back cushion */}
      <rect x="5" y="68" width="120" height="40" rx="10" fill="#4B5563" />
      {/* Couch left armrest */}
      <rect x="5" y="68" width="22" height="95" rx="9" fill="#4B5563" />
      {/* Couch right armrest */}
      <rect x="103" y="78" width="22" height="85" rx="9" fill="#4B5563" />
      {/* Couch seat */}
      <rect x="5" y="105" width="120" height="58" rx="8" fill="#374151" />
      {/* Seat seam */}
      <line x1="65" y1="105" x2="65" y2="163" stroke="#2D3748" strokeWidth="1.5" opacity="0.7" />

      {/* Legs hanging off couch */}
      <rect x="30" y="113" width="14" height="48" rx="7" fill="#1e293b" />
      <rect x="54" y="113" width="14" height="48" rx="7" fill="#1e293b" />
      <ellipse cx="37" cy="163" rx="13" ry="6" fill="#0f172a" />
      <ellipse cx="61" cy="163" rx="13" ry="6" fill="#0f172a" />
      <ellipse cx="40" cy="160" rx="10" ry="4" fill="#1e293b" />
      <ellipse cx="64" cy="160" rx="10" ry="4" fill="#1e293b" />

      {/* Body hoodie */}
      <path d="M28 86 C22 96 21 110 23 118 L87 118 C89 110 88 96 82 86 C75 80 35 80 28 86 Z" fill="#60A5FA" />
      <path d="M37 102 Q55 98 73 102 L72 114 Q55 118 38 114 Z" fill="rgba(0,0,0,0.12)" />
      <ellipse cx="34" cy="88" rx="10" ry="4" fill="rgba(255,255,255,0.18)" transform="rotate(-15,34,88)" />

      {/* Left arm resting on armrest */}
      <path d="M28 90 Q17 100 14 116" stroke="#60A5FA" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="118" r="7" fill={sk} />

      {/* Right arm pointing at screen */}
      <path d="M82 90 Q96 100 100 114" stroke="#60A5FA" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="116" r="7" fill={sk} />

      {/* Neck */}
      <rect x="49" y="74" width="12" height="11" rx="5.5" fill={sk} />

      {/* Head */}
      <circle cx="55" cy="57" r="20" fill={sk} />
      <ellipse cx="48" cy="50" rx="7" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-15,48,50)" />
      <ellipse cx="35" cy="57" rx="4" ry="5" fill={sk} />
      <ellipse cx="75" cy="57" rx="4" ry="5" fill={sk} />
      <ellipse cx="35" cy="57" rx="2.5" ry="3.5" fill="#e09070" opacity="0.5" />

      {/* Hair */}
      <ellipse cx="55" cy="41" rx="20" ry="13" fill={hr} />
      <path d="M35 51 Q35 37 55 36 Q75 37 75 51" fill={hr} />
      <ellipse cx="36" cy="48" rx="4" ry="6" fill={hr} />
      <ellipse cx="74" cy="48" rx="4" ry="6" fill={hr} />
      {/* Cap */}
      <ellipse cx="55" cy="38" rx="22" ry="8" fill="#0f172a" />
      {/* Brim angled toward screen (right) */}
      <path d="M75 39 Q84 41 86 37 Q84 33 75 37 Z" fill="#1e293b" />

      {/* Eyebrows — excited */}
      <path d="M43 48 Q48 45 53 48" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M58 48 Q63 45 68 48" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Eyes — pupils shifted right (looking at screen) */}
      <circle cx="48" cy="56" r="5.5" fill="#fff" />
      <circle cx="62" cy="56" r="5.5" fill="#fff" />
      <circle cx="49.5" cy="56.5" r="3.5" fill="#1a1a2e" />
      <circle cx="63.5" cy="56.5" r="3.5" fill="#1a1a2e" />
      <circle cx="50.8" cy="55" r="1.4" fill="#fff" />
      <circle cx="65" cy="55" r="1.4" fill="#fff" />
      {/* Nose */}
      <path d="M53 62 Q55 65 57 62" stroke="#c4845c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Big smile */}
      <path d="M45 69 Q55 79 65 69" stroke="#a0522d" strokeWidth="2" fill="#e07060" strokeLinecap="round" />
      <ellipse cx="41" cy="64" rx="5" ry="3" fill="#ffb3a7" opacity="0.45" />
      <ellipse cx="69" cy="64" rx="5" ry="3" fill="#ffb3a7" opacity="0.45" />

      {/* === TV / SCREEN === */}
      {/* TV bezel */}
      <rect x="130" y="18" width="86" height="72" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />
      {/* Screen */}
      <rect x="134" y="22" width="78" height="60" rx="3" fill="#080f1e" />
      {/* Video content */}
      <rect x="134" y="22" width="78" height="60" rx="3" fill="#0d2137" />
      {/* Channel strip */}
      <rect x="134" y="22" width="78" height="12" rx="3" fill="#0f172a" opacity="0.8" />
      {/* YouTube-style play thumb */}
      <rect x="138" y="36" width="70" height="40" rx="2" fill="#0a1a2e" />
      <circle cx="173" cy="56" r="11" fill="rgba(0,0,0,0.4)" />
      <polygon points="170,51 170,61 180,56" fill="rgba(255,255,255,0.85)" />
      {/* Channel logo + title */}
      <circle cx="140" cy="28" r="4" fill="#ef4444" />
      <text x="148" y="31" fontSize="5" fill="#94a3b8">Creator Channel</text>
      {/* Progress bar */}
      <rect x="134" y="78" width="78" height="3" rx="1.5" fill="#1e293b" />
      <motion.rect x="134" y="78" width="0" height="3" rx="1.5" fill="#3b82f6"
        animate={{ width: [10, 68, 10] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      />
      {/* Screen glow pulse */}
      <motion.rect x="134" y="22" width="78" height="60" rx="3" fill="#3b82f6"
        animate={{ opacity: [0.02, 0.06, 0.02] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      {/* TV stand */}
      <rect x="169" y="90" width="7" height="20" rx="3" fill="#1e293b" />
      <rect x="157" y="108" width="31" height="6" rx="3" fill="#1e293b" />

      {/* === EMOJI REACTIONS floating from screen === */}
      {FAN_EMOJIS.map(({ emoji, x, delay }) => (
        <motion.text
          key={emoji + x}
          x={x} y={22} fontSize="13"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: [0, 1, 1, 0], y: [22, 5, -12, -30] }}
          transition={{ duration: 2.8, delay, repeat: Infinity, repeatDelay: 2.5 }}
        >
          {emoji}
        </motion.text>
      ))}
    </svg>
  );
}

const CHAT_LINES = [
  { y: 48, w: 32, c: '#3b82f6' },
  { y: 56, w: 40, c: '#8b5cf6' },
  { y: 64, w: 26, c: '#06b6d4' },
  { y: 72, w: 36, c: '#10b981' },
  { y: 80, w: 29, c: '#f59e0b' },
];

function CreatorStudioScene() {
  const sk = '#D49168', hr = '#1a0800';
  return (
    <svg width="280" height="196" viewBox="0 0 220 175">
      {/* === DESK === */}
      <rect x="5" y="110" width="210" height="9" rx="3" fill="#1e293b" />
      <rect x="12" y="119" width="8" height="50" rx="3" fill="#1e293b" />
      <rect x="200" y="119" width="8" height="50" rx="3" fill="#1e293b" />
      <rect x="10" y="119" width="200" height="18" rx="2" fill="#0f172a" opacity="0.5" />

      {/* === LEFT MONITOR (analytics) === */}
      <rect x="7" y="36" width="58" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <rect x="10" y="39" width="52" height="40" rx="2" fill="#060d1a" />
      {/* Graph line */}
      <polyline points="13,72 19,64 25,67 31,57 37,61 43,53 49,55 57,50" fill="none" stroke="#22c55e" strokeWidth="1.8" />
      <motion.circle cx="57" cy="50" r="2.5" fill="#22c55e"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
      <text x="11" y="47" fontSize="5" fill="#475569">ANALYTICS</text>
      {/* Stand */}
      <rect x="33" y="84" width="5" height="12" rx="2" fill="#1e293b" />
      <rect x="26" y="95" width="19" height="4" rx="2" fill="#1e293b" />

      {/* === CENTER MONITOR (LIVE main screen) === */}
      <rect x="72" y="18" width="76" height="62" rx="5" fill="#0f172a" stroke="#475569" strokeWidth="2" />
      <rect x="76" y="22" width="68" height="52" rx="3" fill="#060d1a" />
      {/* LIVE badge */}
      <motion.rect x="79" y="25" width="22" height="9" rx="4.5" fill="#ef4444"
        animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <text x="84" y="32" fontSize="5.5" fill="#fff" fontWeight="bold">LIVE</text>
      {/* Viewer count */}
      <text x="104" y="32" fontSize="4.5" fill="#94a3b8">👁 12.4K</text>
      {/* Waveform */}
      <motion.g
        animate={{ scaleY: [0.7, 1.5, 0.8, 1.3, 0.6, 1.4, 1.0] }}
        transition={{ duration: 0.9, repeat: Infinity }}
        style={{ transformOrigin: '110px 58px' }}
      >
        {[79, 83, 87, 91, 95, 99, 103, 107, 111, 115, 119, 123, 127, 131, 135].map((bx, i) => (
          <rect key={i} x={bx} y="54" width="2.5" height={4 + (i % 4) * 2.5} rx="1" fill="#F87171" opacity="0.8" />
        ))}
      </motion.g>
      {/* Stand */}
      <rect x="107" y="80" width="6" height="16" rx="2.5" fill="#1e293b" />
      <rect x="98" y="95" width="24" height="4" rx="2" fill="#1e293b" />

      {/* === RIGHT MONITOR (live chat) === */}
      <rect x="155" y="38" width="58" height="48" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <rect x="158" y="41" width="52" height="40" rx="2" fill="#060d1a" />
      <text x="159" y="48" fontSize="5" fill="#475569">CHAT</text>
      {CHAT_LINES.map((c, i) => (
        <motion.rect key={i} x={161} y={c.y} width={c.w} height="4.5" rx="2.2"
          fill={c.c} opacity="0.65"
          animate={{ opacity: [0, 0.65, 0.65] }}
          transition={{ delay: i * 0.8, duration: 0.4, repeat: Infinity, repeatDelay: 3.5 }}
        />
      ))}
      {/* Stand */}
      <rect x="181" y="86" width="5" height="12" rx="2" fill="#1e293b" />
      <rect x="174" y="97" width="19" height="4" rx="2" fill="#1e293b" />

      {/* === CHAIR === */}
      <rect x="72" y="120" width="76" height="12" rx="6" fill="#1e293b" />
      <rect x="74" y="100" width="8" height="22" rx="3" fill="#334155" />
      <rect x="138" y="100" width="8" height="22" rx="3" fill="#334155" />
      <rect x="74" y="100" width="72" height="6" rx="3" fill="#334155" />

      {/* Legs */}
      <rect x="88" y="118" width="13" height="38" rx="6.5" fill="#4a1942" />
      <rect x="109" y="118" width="13" height="38" rx="6.5" fill="#4a1942" />
      <ellipse cx="94.5" cy="157" rx="11" ry="5.5" fill="#2d0f26" />
      <ellipse cx="115.5" cy="157" rx="11" ry="5.5" fill="#2d0f26" />
      <rect x="85" y="146" width="19" height="9" rx="4" fill="#3d1535" />
      <rect x="106" y="146" width="19" height="9" rx="4" fill="#3d1535" />

      {/* Body */}
      <path d="M80 80 C74 89 73 105 75 115 L135 115 C137 105 136 89 130 80 C122 74 88 74 80 80 Z" fill="#F87171" />
      <ellipse cx="105" cy="82" rx="18" ry="5" fill="rgba(255,255,255,0.15)" />
      {/* REC badge */}
      <rect x="90" y="90" width="30" height="13" rx="6.5" fill="rgba(0,0,0,0.22)" />
      <motion.circle cx="97" cy="96.5" r="3" fill="#ef4444"
        animate={{ opacity: [1, 0.25, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <text x="103" y="100" fontSize="7" fill="rgba(255,255,255,0.85)" fontWeight="bold">REC</text>

      {/* Arms on desk */}
      <path d="M80 85 Q62 98 56 110" stroke="#F87171" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="56" cy="112" r="7" fill={sk} />
      <path d="M130 85 Q148 98 154 110" stroke="#F87171" strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="154" cy="112" r="7" fill={sk} />
      {/* Keyboard */}
      <rect x="88" y="109" width="34" height="4" rx="2" fill="#334155" opacity="0.8" />

      {/* Neck */}
      <rect x="100" y="67" width="12" height="11" rx="5.5" fill={sk} />

      {/* === ANIMATED HEAD === */}
      <motion.g
        animate={{ x: [-4, 4, -2, 5, -3, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Head */}
        <circle cx="106" cy="50" r="21" fill={sk} />
        <ellipse cx="99" cy="43" rx="7" ry="5" fill="rgba(255,255,255,0.1)" transform="rotate(-15,99,43)" />
        {/* Ears (hidden by headset) */}
        <ellipse cx="85" cy="50" rx="4" ry="5.5" fill={sk} />
        <ellipse cx="127" cy="50" rx="4" ry="5.5" fill={sk} />
        {/* Headset earcups */}
        <ellipse cx="85" cy="50" rx="6.5" ry="8.5" fill="#1e293b" />
        <ellipse cx="127" cy="50" rx="6.5" ry="8.5" fill="#1e293b" />
        <ellipse cx="85" cy="50" rx="4.5" ry="6.5" fill="#334155" />
        <ellipse cx="127" cy="50" rx="4.5" ry="6.5" fill="#334155" />
        {/* Headband */}
        <path d="M85 42 Q106 22 127 42" stroke="#1e293b" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M85 42 Q106 24 127 42" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Boom mic */}
        <path d="M85 56 Q76 64 74 72" stroke="#475569" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="73" cy="74" rx="4.5" ry="5.5" fill="#334155" />
        <motion.ellipse cx="73" cy="74" rx="6" ry="7" fill="none" stroke="#F87171" strokeWidth="1.3"
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />

        {/* Hair */}
        <ellipse cx="106" cy="33" rx="21" ry="14" fill={hr} />
        <path d="M85 44 Q80 58 82 69" stroke={hr} strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M127 44 Q132 58 130 69" stroke={hr} strokeWidth="9" strokeLinecap="round" fill="none" />

        {/* Eyebrows */}
        <path d="M94 40 Q99 37 104 40" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M108 40 Q113 37 118 40" stroke={hr} strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <circle cx="99" cy="49" r="5.5" fill="#fff" />
        <circle cx="113" cy="49" r="5.5" fill="#fff" />
        <circle cx="99" cy="49.5" r="3.5" fill="#1a0800" />
        <circle cx="113" cy="49.5" r="3.5" fill="#1a0800" />
        <circle cx="100.3" cy="48" r="1.4" fill="#fff" />
        <circle cx="114.3" cy="48" r="1.4" fill="#fff" />
        {/* Nose */}
        <path d="M104 56 Q106 59 108 56" stroke="#b06040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Smile */}
        <path d="M96 63 Q106 73 116 63" stroke="#8b3a2a" strokeWidth="2" fill="#d06050" strokeLinecap="round" />
        <ellipse cx="91" cy="58" rx="5" ry="3" fill="#ff9988" opacity="0.45" />
        <ellipse cx="121" cy="58" rx="5" ry="3" fill="#ff9988" opacity="0.45" />

        {/* === THOUGHT CLOUD === */}
        <motion.g
          animate={{ opacity: [0.7, 1, 0.7], y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="126" cy="30" r="3" fill="rgba(255,255,255,0.85)" />
          <circle cx="133" cy="23" r="4" fill="rgba(255,255,255,0.9)" />
          <circle cx="143" cy="15" r="7.5" fill="rgba(255,255,255,0.92)" />
          <circle cx="155" cy="13" r="9" fill="rgba(255,255,255,0.92)" />
          <circle cx="165" cy="16" r="7.5" fill="rgba(255,255,255,0.92)" />
          <circle cx="158" cy="22" r="7" fill="rgba(255,255,255,0.92)" />
          <rect x="135" y="13" width="37" height="12" fill="rgba(255,255,255,0.92)" />
          <text x="154" y="23" fontSize="10" textAnchor="middle">💡</text>
        </motion.g>

        {/* === SOUND WAVES (right of head) === */}
        {[1, 2, 3].map((i) => (
          <motion.path key={i}
            d={`M ${120 + i * 6} ${54 - i * 4} Q ${124 + i * 6} ${47} ${120 + i * 6} ${40 + i * 4}`}
            fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round"
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </motion.g>
    </svg>
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

      <div className="text-center relative">
        <p className="text-2xl mb-6" style={{ color: palette.textMuted }}>
          What if the next MrBeast...
        </p>

        <h1 className="text-6xl font-black mb-6" style={{ color: palette.text }}>
          ...was funded by{' '}
          <span style={{ color: palette.accent }}>fans</span>?
        </h1>

        <p className="text-xl" style={{ color: palette.primary }}>
          Not VCs. Not brands. Their own audience.
        </p>

        <div
          className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-xl"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <Youtube size={20} style={{ color: '#FF0000' }} />
          <span className="text-lg font-bold" style={{ color: palette.text }}>
            50M+ creators worldwide
          </span>
          <span className="text-lg" style={{ color: palette.textMuted }}>|</span>
          <span className="text-lg font-bold" style={{ color: palette.accent }}>
            $0 from their fans as investors
          </span>
        </div>
      </div>
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
          <FanSittingScene />
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
          <CreatorStudioScene />
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
          <svg width="100" height="160" viewBox="-5 -70 110 230">
            <FanCharacter scale={0.6} mood="excited" animate={false} />
            <g transform="translate(0, 80)">
              <FloatingHearts count={3} />
            </g>
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

          <svg width="100" height="160" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.6} mood="excited" animate={false} />
            <MoneyParticles count={4} spread={90} />
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
          // transition={{ delay: 0.5 }}
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
                <div
                  key={cat.label}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
                  // initial={{ opacity: 0, scale: 0.8 }}
                  // animate={{ opacity: 1, scale: 1 }}
                  // transition={{ delay: 1 + i * 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color: palette.primary }} />
                    <span className="text-xs font-medium" style={{ color: palette.textMuted }}>{cat.label}</span>
                  </div>
                  <p
                    className="text-3xl font-black"
                    style={{ color }}
                    // initial={{ opacity: 0 }}
                    // animate={{ opacity: 1 }}
                    // transition={{ delay: 1.5 + i * 0.6 }}
                  >
                    {cat.value}
                  </p>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: palette.surfaceAlt }}>
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, width: `${cat.value}%` }}
                      // initial={{ width: 0 }}
                      // animate={{ width: `${cat.value}%` }}

                      // transition={{ delay: 1.5 + i * 0.6, duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall score */}
          <div
            className="mt-4 rounded-xl p-4 flex items-center justify-between"
            style={{ background: `${palette.primary}15`, border: `1px solid ${palette.primary}40` }}
            // initial={{ opacity: 0, y: 20 }}
            // animate={{ opacity: 1, y: 0 }}
            // transition={{ delay: 5.5 }}
          >
            <div className="flex items-center gap-3">
              <Brain size={24} style={{ color: palette.primary }} />
              <div>
                <p className="text-sm font-bold" style={{ color: palette.text }}>AI Investability Score</p>
                <p className="text-xs" style={{ color: palette.textMuted }}>Based on 2,400+ data points</p>
              </div>
            </div>
            <p
              className="text-4xl font-black"
              style={{ color: palette.success }}
              // animate={{ scale: [1, 1.1, 1] }}
              // transition={{ delay: 6, duration: 0.5 }}
            >
              74/100
            </p>
          </div>
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
            <MoneyParticles count={5} spread={80} />
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
          className="flex-1 rounded-2xl p-6 relative overflow-hidden"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <MoneyParticles count={6} spread={280} />
          </svg>
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
      <h2
        className="text-3xl font-black text-center mb-4"
        style={{ color: palette.text }}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
      >
        The <span style={{ color: palette.accent }}>FanZFolio</span> Flywheel
      </h2>
      <p
        className="text-base text-center mb-10"
        style={{ color: palette.textMuted }}
        // initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        // transition={{ delay: 0.3 }}
      >
        A self-reinforcing cycle where everyone wins.
      </p>

      {/* Circular flywheel */}
      <div className="relative w-[500px] h-[500px]">
        {/* Center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center z-10"
          style={{ background: palette.gradient }}
          // initial={{ scale: 0 }}
          // animate={{ scale: 1, rotate: 360 }}
          // transition={{ delay: 0.5, duration: 1, type: 'spring' }}
        >
          <Rocket size={32} color="#fff" />
        </div>

        {/* Connecting circle */}
        <div
          className="absolute inset-12 rounded-full"
          style={{ border: `2px dashed ${palette.border}` }}
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 0.5 }}
          // transition={{ delay: 0.8 }}
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
            <div
              key={step.label}
              className="absolute flex flex-col items-center w-32"
              style={{ left: `calc(50% + ${x}px - 64px)`, top: `calc(50% + ${y}px - 40px)` }}
              // initial={{ opacity: 0, scale: 0 }}
              // animate={{ opacity: 1, scale: 1 }}
              // transition={{ delay: 1.5 + i * 1.2, type: 'spring' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                style={{ backgroundColor: `${step.color}22`, border: `1px solid ${step.color}40` }}
              >
                <Icon size={20} style={{ color: step.color }} />
              </div>
              <p className="text-xs font-bold text-center" style={{ color: palette.text }}>{step.label}</p>
              <p className="text-[9px] text-center mt-0.5" style={{ color: palette.textMuted }}>{step.desc}</p>
            </div>
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
            <div
              key={`arrow-${i}`}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 8px)`,
                top: `calc(50% + ${y}px - 8px)`,
                transform: `rotate(${angle + 90}deg)`,
              }}
              // initial={{ opacity: 0 }}
              // animate={{ opacity: 0.6 }}
              // transition={{ delay: 2 + i * 1.2 }}
            >
              <ArrowRight size={16} style={{ color: palette.primary }} />
            </div>
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

      <div className="relative text-center max-w-3xl">
        {/* Characters celebrating */}
        <div
          className="flex items-center justify-center gap-6 mb-8"
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
        >
          <svg width="80" height="140" viewBox="-5 -50 110 210">
            <FanCharacter scale={0.55} mood="excited" animate={false} />
            <g transform="translate(0, 80)">
              <FloatingHearts count={4} />
            </g>
          </svg>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: palette.gradient }}>
              <TrendingUp size={24} color="#fff" />
            </div>
            <span className="text-4xl font-black" style={{ color: palette.text }}>
              Fan<span style={{ color: palette.accent }}>Z</span><span style={{ color: palette.primary }}>Folio</span>
            </span>
          </div>

          <svg width="80" height="140" viewBox="0 0 100 160">
            <CreatorCharacter scale={0.55} mood="excited" animate={false} />
            <MoneyParticles count={5} spread={80} />
          </svg>
        </div>

        <h1
          className="text-5xl font-black mb-4"
          style={{ color: palette.text }}
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ delay: 0.8 }}
        >
          Join Us in Building the{' '}
          <span style={{ background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Future of Creator Finance
          </span>
        </h1>

        <p
          className="text-xl mb-10"
          style={{ color: palette.textMuted }}
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // transition={{ delay: 1.8 }}
        >
          We're raising to scale AI underwriting, onboard 10,000 creators, and launch real transactions.
        </p>

        {/* What we're building */}
        <div
          className="grid grid-cols-3 gap-4 mb-10"
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ delay: 3 }}
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
        </div>

        <div
          className="flex items-center justify-center gap-6"
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // transition={{ delay: 5 }}
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
        </div>

        <p
          className="text-lg mt-8"
          style={{ color: palette.textSubtle }}
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          // transition={{ delay: 7 }}
        >
          Let's talk.
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────── */

export function PitchV4() {
  const { palette, setPalette } = useTheme();
  const [currentScene, setCurrentScene] = useState(0);
  const [paused, setPaused] = useState(true);
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
        <motion.div className="h-full" style={{ background: palette.gradient }} animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }} transition={{ duration: scenes[currentScene].duration / 1000 }} />
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
