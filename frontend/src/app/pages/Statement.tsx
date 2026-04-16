import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { callApi } from '../services/apiService';
import type { StatementData } from '../data/mockData';
import { FileText, TrendingUp, ArrowLeft, Download, Share2, CheckCircle, Info } from 'lucide-react';

function Row({ label, value, highlight = false, large = false }: { label: string; value: string; highlight?: boolean; large?: boolean }) {
  const { palette } = useTheme();
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: `1px solid ${palette.border}` }}
    >
      <span
        className={large ? 'font-semibold' : 'text-sm'}
        style={{ color: highlight ? palette.text : palette.textMuted }}
      >
        {label}
      </span>
      <span
        className={large ? 'font-bold text-lg' : 'text-sm font-semibold'}
        style={{ color: highlight ? palette.success : palette.text }}
      >
        {value}
      </span>
    </div>
  );
}

export function Statement() {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const [d, setD] = useState<StatementData | null>(null);

  useEffect(() => {
    callApi<StatementData>('getStatementData_Statement').then(res => setD(res.data));
  }, []);

  if (!d) return null;

  const overBase = ((d.actualViews - d.estimatedViews.base) / d.estimatedViews.base * 100).toFixed(1);

  return (
    <div style={{ backgroundColor: palette.bg, minHeight: '100vh' }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 text-sm mb-8"
          style={{ color: palette.textMuted }}
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </button>

        {/* Statement Header */}
        <div
          className="rounded-2xl p-6 mb-6 relative overflow-hidden"
          style={{ background: palette.gradient }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} style={{ color: palette.onPrimary, opacity: 0.7 }} />
                <span className="text-sm font-medium" style={{ color: `${palette.onPrimary}cc` }}>
                  Monthly Payout Statement
                </span>
              </div>
              <h1 className="text-2xl font-black mb-1" style={{ color: palette.onPrimary }}>{d.month}</h1>
              <p style={{ color: `${palette.onPrimary}cc` }}>{d.creatorName} · {d.creatorHandle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: `${palette.onPrimary}80` }}>Investor</p>
              <p className="font-bold" style={{ color: palette.onPrimary }}>{d.investorName}</p>
            </div>
          </div>

          {/* Payout callout */}
          <div
            className="mt-5 inline-flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{ backgroundColor: `${palette.onPrimary}18` }}
          >
            <CheckCircle size={20} style={{ color: palette.onPrimary }} />
            <div>
              <p className="text-xs" style={{ color: `${palette.onPrimary}aa` }}>Your payout this month</p>
              <p className="text-2xl font-black" style={{ color: palette.onPrimary }}>${d.yourPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Channel Performance — {d.month}</h3>

          <div
            className="flex items-center gap-3 p-3 rounded-xl mb-4"
            style={{ backgroundColor: `${palette.success}12`, border: `1px solid ${palette.success}30` }}
          >
            <TrendingUp size={16} style={{ color: palette.success }} />
            <p className="text-sm" style={{ color: palette.success }}>
              <strong>+{overBase}% above Base forecast</strong> — {d.performanceNotes}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Low Forecast', value: `${(d.estimatedViews.low / 1e6).toFixed(0)}M`, color: palette.warning },
              { label: 'Base Forecast', value: `${(d.estimatedViews.base / 1e6).toFixed(0)}M`, color: palette.primary },
              { label: 'High Forecast', value: `${(d.estimatedViews.high / 1e6).toFixed(0)}M`, color: palette.success },
            ].map(item => (
              <div
                key={item.label}
                className="text-center p-3 rounded-xl"
                style={{ backgroundColor: palette.surfaceAlt }}
              >
                <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-0.5" style={{ color: palette.textSubtle }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{ backgroundColor: `${palette.primary}15`, border: `1px solid ${palette.primary}30` }}
          >
            <span className="text-sm font-semibold" style={{ color: palette.text }}>Actual Views</span>
            <span className="font-bold" style={{ color: palette.primary }}>
              {(d.actualViews / 1e6).toFixed(1)}M views
            </span>
          </div>
        </div>

        {/* Payout Calculation */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Payout Calculation</h3>

          <Row label="Your investment" value={`$${d.investedAmount}`} />
          <Row label="Revenue share rate" value={`${d.revenueShare}%`} />
          <Row label="Term" value={`${d.term} months`} />
          <Row label="Actual views (Feb)" value={`${(d.actualViews / 1e6).toFixed(1)}M`} />
          <Row label="Estimated RPM" value={`$${d.estimatedRPM}`} />
          <Row label="Estimated channel revenue" value={`$${d.estimatedRevenue.toLocaleString()}`} />
          <Row label={`Your share (${d.revenueShare}% × $${d.estimatedRevenue.toLocaleString()})`} value={`$${(d.estimatedRevenue * d.yourShareRate).toFixed(0)}`} />

          <div className="mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: palette.text }}>Your payout — February</span>
              <span className="text-xl font-black" style={{ color: palette.success }}>+${d.yourPayout.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Info size={12} style={{ color: palette.textSubtle }} />
              <p className="text-xs" style={{ color: palette.textSubtle }}>
                Payout is proportional to your investment vs. total campaign raise of ${(37500).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cumulative */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}
        >
          <h3 className="font-bold mb-4" style={{ color: palette.text }}>Cumulative Performance</h3>
          <Row label="Month 1 payout (Jan)" value="$6.00" />
          <Row label="Month 2 payout (Feb)" value="$6.22" />
          <div className="mt-4 pt-4 flex items-center justify-between">
            <span className="font-bold" style={{ color: palette.text }}>Total earned (2 months)</span>
            <span className="text-xl font-black" style={{ color: palette.success }}>+${d.cumulativeEarned.toFixed(2)}</span>
          </div>
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: palette.surfaceAlt }}>
            <p className="text-xs mb-2" style={{ color: palette.textMuted }}>Projected total at term (12 months)</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-bold" style={{ color: palette.warning }}>${d.projectedTotal.low}</p>
                <p className="text-xs" style={{ color: palette.textSubtle }}>Low</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg" style={{ color: palette.success }}>${d.projectedTotal.base}</p>
                <p className="text-xs" style={{ color: palette.textSubtle }}>Base</p>
              </div>
              <div className="text-center">
                <p className="font-bold" style={{ color: palette.primaryLight }}>${d.projectedTotal.high}</p>
                <p className="text-xs" style={{ color: palette.textSubtle }}>High</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: palette.surface, color: palette.text, border: `1px solid ${palette.border}` }}
          >
            <Download size={14} /> Download PDF
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: palette.gradient, color: palette.onPrimary }}
          >
            <Share2 size={14} /> Share Statement
          </button>
        </div>
      </div>
    </div>
  );
}
