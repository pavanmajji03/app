import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

function creatorHasReport(email: string | undefined): boolean {
  if (!email) return false;
  return !!localStorage.getItem(`fanfolio_creator_report_${email}`);
}

function creatorHasCampaign(email: string | undefined): boolean {
  if (!email) return false;
  return !!localStorage.getItem(`fanfolio_campaign_id_${email}`);
}

function creatorHasAnalysisInProgress(email: string | undefined): boolean {
  if (!email) return false;
  // analysisId persisted but report not yet saved = analysis still running
  return (
    !!localStorage.getItem(`fanfolio_analysis_id_${email}`) &&
    !localStorage.getItem(`fanfolio_creator_report_${email}`)
  );
}

function creatorDest(email: string | undefined): string {
  if (creatorHasCampaign(email)) return '/campaign-live';
  if (creatorHasReport(email)) return '/report';
  if (creatorHasAnalysisInProgress(email)) return '/analysis';
  return '/onboard';
}

export function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'creator') {
    return <Navigate to={creatorDest(user.email)} replace />;
  }
  return <Navigate to="/fanlanding" replace />;
}

export function FanGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'creator') {
      const dest = creatorDest(user.email);
      // Allow creators to browse fan pages while analysis is still running
      if (dest !== '/analysis') {
        navigate(dest, { replace: true });
      }
    }
  }, [user, navigate]);

  // Block creators only when they have a definitive home (report / campaign)
  // If analysis is in progress, let them through so they can explore the marketplace
  if (user?.role === 'creator' && creatorDest(user.email) !== '/analysis') return null;
  return <>{children}</>;
}

export function CreatorGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'fan') {
      navigate('/', { replace: true });
      return;
    }
    // Creator already has progress — skip onboarding
    if (user?.role === 'creator') {
      const dest = creatorDest(user.email);
      if (dest !== '/onboard') {
        navigate(dest, { replace: true });
      }
    }
  }, [user, navigate]);

  if (user?.role === 'fan') return null;
  if (user?.role === 'creator' && creatorDest(user.email) !== '/onboard') return null;
  return <>{children}</>;
}
