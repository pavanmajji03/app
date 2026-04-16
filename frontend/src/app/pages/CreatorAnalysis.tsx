import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { callApi } from '../services/apiService';
import type { AnalysisStep, SignalSummary } from '../data/mockData';
import { CheckCircle, Loader2, Brain, Youtube, Globe, TrendingUp, Zap, Compass, ArrowRight } from 'lucide-react';

const iconMap: Record<string, any> = { Youtube, TrendingUp, Globe, Brain, Zap };

export function CreatorAnalysis() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [signalSummary, setSignalSummary] = useState<SignalSummary[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Capture isReturn ONCE via useState so re-renders don't change it
  const [isReturn] = useState(() => sessionStorage.getItem('fanfolio_anim_done') === '1');
  const [animDone, setAnimDone] = useState(isReturn);

  // analysisId: sessionStorage first, localStorage fallback (survives logout/login)
  const [analysisId, setAnalysisId] = useState<string | null>(
    () => sessionStorage.getItem('fanfolio_analysis_id')
  );

  // Mark as "seen" once on mount (after first render) so that navigating away at
  // any point — even before analysis-steps.json loads — and coming back shows
  // return state rather than replaying the animation from scratch
  useEffect(() => {
    if (sessionStorage.getItem('fanfolio_analysis_id')) {
      sessionStorage.setItem('fanfolio_anim_done', '1');
    }
  }, []);
  const [beStatus, setBeStatus] = useState<'idle' | 'polling' | 'completed' | 'failed'>('idle');
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore analysisId from localStorage if sessionStorage lost it (e.g. after logout/login)
  useEffect(() => {
    if (!analysisId && user?.email) {
      const stored = localStorage.getItem(`fanfolio_analysis_id_${user.email}`);
      if (stored) {
        sessionStorage.setItem('fanfolio_analysis_id', stored);
        setAnalysisId(stored);
      }
    }
  }, [user, analysisId]);

  // If report already exists in localStorage (e.g. completed while on marketplace), skip straight to /report
  useEffect(() => {
    if (!user?.email) return;
    const cachedReport = localStorage.getItem(`fanfolio_creator_report_${user.email}`);
    if (cachedReport) {
      sessionStorage.setItem('fanfolio_report', cachedReport);
      navigate('/report', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    callApi<{ steps: AnalysisStep[]; signalSummary: SignalSummary[] }>('getAnalysisSteps_CreatorAnalysis').then(res => {
      setAnalysisSteps(res.data.steps);
      setSignalSummary(res.data.signalSummary);
      setLoaded(true);
    });
  }, []);

  // Start polling BE if we have an analysis_id
  useEffect(() => {
    if (!analysisId) return;
    setBeStatus('polling');

    const poll = async () => {
      try {
        const res = await callApi<{ status: string; report: unknown; creator_id?: string; error?: string }>(
          'pollAnalysis_CreatorAnalysis',
          { pathParams: { analysis_id: analysisId } }
        );
        if (res.data.status === 'completed') {
          const reportJson = JSON.stringify(res.data.report);
          sessionStorage.setItem('fanfolio_report', reportJson);
          if (user?.email) {
            localStorage.setItem(`fanfolio_creator_report_${user.email}`, reportJson);
            // Save creator_id so onboarding form can be pre-populated on re-run
            if (res.data.creator_id) {
              localStorage.setItem(`fanfolio_creator_id_${user.email}`, res.data.creator_id);
            }
            // analysis is no longer "in progress" — clean up so RoleGuard won't loop back here
            localStorage.removeItem(`fanfolio_analysis_id_${user.email}`);
          }
          setBeStatus('completed');
        } else if (res.data.status === 'failed') {
          if (user?.email) localStorage.removeItem(`fanfolio_analysis_id_${user.email}`);
          setBeStatus('failed');
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch {
        pollRef.current = setTimeout(poll, 5000);
      }
    };

    poll();
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [analysisId]);

  // Run animation steps — advances through all but the last step, then holds
  // The last step stays spinning until the backend actually completes
  useEffect(() => {
    if (!loaded || analysisSteps.length === 0 || isReturn) return;

    let timeout: ReturnType<typeof setTimeout>;
    const lastIdx = analysisSteps.length - 1;

    const runStep = (stepIdx: number) => {
      setCurrentStep(stepIdx);
      if (stepIdx >= lastIdx) {
        return; // hold here — last step stays spinning until BE is done
      }
      timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIdx]);
        runStep(stepIdx + 1);
      }, analysisSteps[stepIdx].duration);
    };

    runStep(0);
    return () => clearTimeout(timeout);
  }, [loaded, analysisSteps, isReturn]);

  // When backend completes, mark the last step green and set animDone
  useEffect(() => {
    if (beStatus === 'completed' && analysisSteps.length > 0) {
      setCompletedSteps(analysisSteps.map((_, i) => i)); // all green
      setAnimDone(true);
      sessionStorage.setItem('fanfolio_anim_done', '1');
    }
    if (beStatus === 'failed') {
      setAnimDone(true);
    }
  }, [beStatus, analysisSteps]);

  // On return visit: mark all steps except the last as completed, last stays spinning
  // (if BE already done, the beStatus effect will flip it to all-green)
  useEffect(() => {
    if (isReturn && analysisSteps.length > 0) {
      const lastIdx = analysisSteps.length - 1;
      setCurrentStep(lastIdx);
      setCompletedSteps(analysisSteps.map((_, i) => i).filter(i => i < lastIdx));
    }
  }, [isReturn, analysisSteps]);

  // Navigate when animation is done AND BE is done
  useEffect(() => {
    if (!animDone) return;
    if (!analysisId || beStatus === 'completed' || beStatus === 'failed') {
      const t = setTimeout(() => navigate('/report'), 800);
      return () => clearTimeout(t);
    }
  }, [animDone, beStatus, analysisId, navigate]);

  const done = beStatus === 'completed';
  // Show "waiting" nudge once animation has reached the last step and BE is still running
  const lastIdx = analysisSteps.length - 1;
  const reachedLastStep = currentStep >= lastIdx && !completedSteps.includes(lastIdx);
  const waitingForBe = reachedLastStep && beStatus === 'polling';

  if (!loaded) return null;

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
          {done ? 'Analysis Complete!' : waitingForBe ? 'AI is Thinking...' : 'Analyzing Your Channel'}
        </h1>
        <p className="text-sm mb-8" style={{ color: palette.textMuted }}>
          {done
            ? 'Your AI underwriting report is ready. Redirecting...'
            : waitingForBe
            ? 'Signals collected. AI model is finalizing your underwriting report...'
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
            const Icon = iconMap[s.icon] || Zap;

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
        <div className="mt-8 grid grid-cols-3 gap-3">
          {signalSummary.map(item => (
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

        {/* Marketplace nudge — shown while AI is still processing */}
        {waitingForBe && (
          <div
            className="mt-6 rounded-2xl p-4 text-left"
            style={{
              backgroundColor: palette.surface,
              border: `1px solid ${palette.border}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${palette.accent ?? palette.primary}18` }}
              >
                <Compass size={18} style={{ color: palette.accent ?? palette.primary }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-0.5" style={{ color: palette.text }}>
                  This might take a minute
                </p>
                <p className="text-xs leading-relaxed" style={{ color: palette.textMuted }}>
                  While the AI finalizes your report, explore what other creators are doing on the marketplace. We'll have your report ready when you come back.
                </p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: `${palette.accent ?? palette.primary}18`,
                    color: palette.accent ?? palette.primary,
                    border: `1px solid ${palette.accent ?? palette.primary}30`,
                  }}
                >
                  Browse Marketplace <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
