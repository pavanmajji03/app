import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle, Loader2, Brain, Youtube, Globe, TrendingUp, Zap } from 'lucide-react';

const analysisSteps = [
  { id: 0, icon: Youtube, label: 'Fetching YouTube channel data', detail: 'Subscribers, uploads, view history...', duration: 1200 },
  { id: 1, icon: TrendingUp, label: 'Analyzing last 30 videos', detail: 'Views, likes, comments, velocity...', duration: 1000 },
  { id: 2, icon: Globe, label: 'Pulling social & trend signals', detail: 'Instagram, X, Google Trends, news mentions...', duration: 1100 },
  { id: 3, icon: Brain, label: 'Running AI underwriting model', detail: 'Scoring risk, forecasting scenarios...', duration: 1400 },
  { id: 4, icon: Zap, label: 'Generating underwriting report', detail: 'Low / Base / High forecasts + risk breakdown...', duration: 800 },
];

export function CreatorAnalysis() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const runStep = (stepIdx: number) => {
      if (stepIdx >= analysisSteps.length) {
        setDone(true);
        return;
      }
      setCurrentStep(stepIdx);
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIdx]);
        runStep(stepIdx + 1);
      }, analysisSteps[stepIdx].duration);
    };

    runStep(0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate('/report'), 800);
      return () => clearTimeout(t);
    }
  }, [done, navigate]);

  const progress = ((completedSteps.length / analysisSteps.length) * 100);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: palette.bg }}
    >
      <div className="max-w-lg w-full mx-auto px-6 py-16 text-center">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
          style={{ background: `${palette.primary}18`, border: `1px solid ${palette.primary}30` }}
        >
          <Brain size={36} style={{ color: palette.primary }} />
          {!done && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: palette.primary }}
            >
              <Loader2 size={12} style={{ color: palette.onPrimary }} className="animate-spin" />
            </div>
          )}
          {done && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: palette.success }}
            >
              <CheckCircle size={12} style={{ color: '#fff' }} />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black mb-2" style={{ color: palette.text }}>
          {done ? 'Analysis Complete!' : 'Analyzing Your Channel'}
        </h1>
        <p className="text-sm mb-8" style={{ color: palette.textMuted }}>
          {done
            ? 'Your AI underwriting report is ready. Redirecting...'
            : 'Our AI is analyzing every public signal to build your underwriting report.'}
        </p>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-8" style={{ backgroundColor: palette.surfaceAlt }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: palette.gradient }}
          />
        </div>

        {/* Steps */}
        <div className="text-left space-y-3">
          {analysisSteps.map((s, i) => {
            const isCompleted = completedSteps.includes(i);
            const isActive = currentStep === i && !isCompleted;
            const isPending = currentStep < i;
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  backgroundColor: isActive ? `${palette.primary}12` : isCompleted ? `${palette.success}08` : 'transparent',
                  border: `1px solid ${isActive ? palette.primary + '30' : isCompleted ? palette.success + '20' : 'transparent'}`,
                  opacity: isPending ? 0.4 : 1,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: isCompleted ? `${palette.success}20` : isActive ? `${palette.primary}20` : palette.surfaceAlt,
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={16} style={{ color: palette.success }} />
                  ) : isActive ? (
                    <Loader2 size={16} style={{ color: palette.primary }} className="animate-spin" />
                  ) : (
                    <Icon size={16} style={{ color: palette.textSubtle }} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: isCompleted ? palette.success : isActive ? palette.text : palette.textSubtle }}
                  >
                    {s.label}
                  </p>
                  {isActive && (
                    <p className="text-xs mt-0.5" style={{ color: palette.textMuted }}>{s.detail}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Signal summary */}
        <div
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Data Points', value: '2,400+' },
            { label: 'Videos Analyzed', value: '30' },
            { label: 'Signals Pulled', value: '12' },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
            >
              <p className="font-bold" style={{ color: palette.primary }}>{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
