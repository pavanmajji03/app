import { useNavigate, useLocation } from 'react-router';
import { useTheme, palettes, PaletteKey } from '../context/ThemeContext';
import { fanFlow, creatorFlow, detectFlow } from '../data/flows';
import { ChevronLeft, ChevronRight, Palette, BookOpen } from 'lucide-react';
import { useState } from 'react';

export function PrototypeBar() {
  const { palette, paletteKey, setPalette } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPalettePanel, setShowPalettePanel] = useState(false);

  const { flow, stepIndex } = detectFlow(location.pathname);

  const getPrev = () => {
    if (!flow) return null;
    if (stepIndex > 0) return flow.steps[stepIndex - 1].path;
    // Switch flows
    if (flow.id === 'creator' && stepIndex === 0) return fanFlow.steps[fanFlow.steps.length - 1].path;
    return null;
  };

  const getNext = () => {
    if (!flow) return null;
    if (stepIndex < flow.steps.length - 1) return flow.steps[stepIndex + 1].path;
    // Switch flows
    if (flow.id === 'fan' && stepIndex === fanFlow.steps.length - 1) return creatorFlow.steps[0].path;
    return null;
  };

  const prev = getPrev();
  const next = getNext();

  const paletteKeys: PaletteKey[] = ['midnight', 'ocean', 'forest', 'luxe'];
  const paletteColors: Record<PaletteKey, string> = {
    midnight: '#8B3DFF',
    ocean: '#2563EB',
    forest: '#00C896',
    luxe: '#E8B423',
  };

  const isStyleGuide = location.pathname === '/style-guide';

  return (
    <>
      {/* Palette Panel */}
      {showPalettePanel && (
        <div
          className="fixed bottom-14 right-4 z-[60] rounded-xl p-3 shadow-2xl"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <p className="text-xs mb-2 font-medium" style={{ color: palette.textMuted }}>Color Palette</p>
          <div className="flex flex-col gap-1.5">
            {paletteKeys.map(key => {
              const p = palettes[key];
              const isSelected = paletteKey === key;
              return (
                <button
                  key={key}
                  onClick={() => { setPalette(key); setShowPalettePanel(false); }}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all"
                  style={{
                    backgroundColor: isSelected ? `${p.primary}22` : 'transparent',
                    border: isSelected ? `1px solid ${p.primary}` : '1px solid transparent',
                  }}
                >
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: p.primary }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: palette.text }}>{p.name}</p>
                    <p className="text-xs" style={{ color: palette.textSubtle }}>{p.description.split('—')[0].trim()}</p>
                  </div>
                  {isSelected && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.primary }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 h-12"
        style={{
          backgroundColor: `${palette.surface}f0`,
          borderTop: `1px solid ${palette.border}`,
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Left: Prototype label + screen name */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: `${palette.primary}22`, color: palette.primary }}
          >
            PROTOTYPE
          </span>
          {flow && (
            <span className="text-xs" style={{ color: palette.textMuted }}>
              {flow.label}: <span style={{ color: palette.text }}>{flow.steps[stepIndex]?.label}</span>
            </span>
          )}
          {isStyleGuide && (
            <span className="text-xs" style={{ color: palette.text }}>Style Guide</span>
          )}
          {!flow && !isStyleGuide && (
            <span className="text-xs" style={{ color: palette.textMuted }}>Navigate below</span>
          )}
        </div>

        {/* Center: Flow steps */}
        <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto mx-4">
          {/* Fan Flow */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {fanFlow.steps.map((step, idx) => {
              const isCurrentFlow = flow?.id === 'fan';
              const isCurrent = isCurrentFlow && idx === stepIndex;
              const isPast = isCurrentFlow && idx < stepIndex;
              return (
                <button
                  key={step.path}
                  onClick={() => navigate(step.path)}
                  className="text-xs px-2 py-0.5 rounded transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: isCurrent ? palette.primary : isPast ? `${palette.primary}30` : 'transparent',
                    color: isCurrent ? palette.onPrimary : isPast ? palette.primary : palette.textSubtle,
                  }}
                  title={step.description}
                >
                  {step.label}
                </button>
              );
            })}
          </div>

          <span style={{ color: palette.border }} className="mx-1 text-xs">│</span>

          {/* Creator Flow */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {creatorFlow.steps.map((step, idx) => {
              const isCurrentFlow = flow?.id === 'creator';
              const isCurrent = isCurrentFlow && idx === stepIndex;
              const isPast = isCurrentFlow && idx < stepIndex;
              return (
                <button
                  key={step.path}
                  onClick={() => navigate(step.path)}
                  className="text-xs px-2 py-0.5 rounded transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: isCurrent ? palette.accent : isPast ? `${palette.accent}30` : 'transparent',
                    color: isCurrent ? palette.onAccent : isPast ? palette.accent : palette.textSubtle,
                  }}
                  title={step.description}
                >
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Prev/Next */}
          <button
            onClick={() => prev && navigate(prev)}
            disabled={!prev}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all"
            style={{
              color: prev ? palette.textMuted : palette.textSubtle,
              opacity: prev ? 1 : 0.4,
              backgroundColor: prev ? `${palette.surfaceAlt}` : 'transparent',
            }}
          >
            <ChevronLeft size={12} /> Prev
          </button>
          <button
            onClick={() => next && navigate(next)}
            disabled={!next}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all"
            style={{
              color: next ? palette.onPrimary : palette.textSubtle,
              opacity: next ? 1 : 0.4,
              backgroundColor: next ? palette.primary : 'transparent',
            }}
          >
            Next <ChevronRight size={12} />
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: palette.border }} />

          {/* Style Guide */}
          <button
            onClick={() => navigate('/style-guide')}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all"
            style={{
              color: isStyleGuide ? palette.accent : palette.textMuted,
              backgroundColor: isStyleGuide ? `${palette.accent}18` : 'transparent',
            }}
          >
            <BookOpen size={12} /> Style Guide
          </button>

          {/* Palette switcher */}
          <button
            onClick={() => setShowPalettePanel(v => !v)}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all"
            style={{
              color: palette.textMuted,
              backgroundColor: showPalettePanel ? `${palette.primary}22` : 'transparent',
            }}
          >
            <Palette size={12} />
            <div className="flex gap-0.5">
              {paletteKeys.map(k => (
                <div
                  key={k}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    backgroundColor: paletteColors[k],
                    transform: paletteKey === k ? 'scale(1.3)' : 'scale(1)',
                    outline: paletteKey === k ? `1.5px solid ${palette.text}` : 'none',
                    outlineOffset: '1px',
                  }}
                />
              ))}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
