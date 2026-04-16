import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { FanGuard, CreatorGuard, RootRedirect } from './components/RoleGuard';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Marketplace } from './pages/Marketplace';
import { CreatorPage } from './pages/CreatorPage';
import { Portfolio } from './pages/Portfolio';
import { Statement } from './pages/Statement';
import { CreatorOnboarding } from './pages/CreatorOnboarding';
import { CreatorAnalysis } from './pages/CreatorAnalysis';
import { CreatorReport } from './pages/CreatorReport';
import { CampaignSetup } from './pages/CampaignSetup';
import { CampaignLive } from './pages/CampaignLive';
import { CampaignPublic } from './pages/CampaignPublic';
import { StyleGuide } from './pages/StyleGuide';
import { AboutUs } from './pages/AboutUs';
import { PitchVideo } from './pages/PitchVideo';
import { PitchV2 } from './pages/PitchV2';
import { PitchV3 } from './pages/PitchV3';
import { PitchV4 } from './pages/PitchV4';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-6xl font-black mb-4" style={{ opacity: 0.15 }}>404</p>
      <p className="text-lg font-bold mb-2">Page not found</p>
      <a href="/" className="text-sm underline opacity-60">Go home</a>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  { path: '/', element: <RootRedirect /> },
  { path: '/pitch', Component: PitchVideo },
  { path: '/pitchv2', Component: PitchV2 },
  { path: '/pitchv3', Component: PitchV3 },
  { path: '/pitchv4', Component: PitchV4 },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { path: 'fanlanding', element: <FanGuard><Home /></FanGuard> },
      { path: 'marketplace', Component: Marketplace },
      { path: 'creator', Component: CreatorPage },
      { path: 'portfolio', Component: Portfolio },
      { path: 'statement', Component: Statement },
      { path: 'onboard', element: <CreatorGuard><CreatorOnboarding /></CreatorGuard> },
      { path: 'analysis', Component: CreatorAnalysis },
      { path: 'report', Component: CreatorReport },
      { path: 'campaign-setup', Component: CampaignSetup },
      { path: 'campaign-live', Component: CampaignLive },
      { path: 'campaign/:id', Component: CampaignPublic },
      { path: 'style-guide', Component: StyleGuide },
      { path: 'about', Component: AboutUs },
      { path: '*', Component: NotFound },
    ],
  },
]);
