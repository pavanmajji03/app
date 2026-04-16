import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { CreatorPage } from './pages/CreatorPage';
import { Portfolio } from './pages/Portfolio';
import { Statement } from './pages/Statement';
import { CreatorOnboarding } from './pages/CreatorOnboarding';
import { CreatorAnalysis } from './pages/CreatorAnalysis';
import { CreatorReport } from './pages/CreatorReport';
import { CampaignSetup } from './pages/CampaignSetup';
import { CampaignLive } from './pages/CampaignLive';
import { StyleGuide } from './pages/StyleGuide';

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
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'marketplace', Component: Marketplace },
      { path: 'creator', Component: CreatorPage },
      { path: 'portfolio', Component: Portfolio },
      { path: 'statement', Component: Statement },
      { path: 'onboard', Component: CreatorOnboarding },
      { path: 'analysis', Component: CreatorAnalysis },
      { path: 'report', Component: CreatorReport },
      { path: 'campaign-setup', Component: CampaignSetup },
      { path: 'campaign-live', Component: CampaignLive },
      { path: 'style-guide', Component: StyleGuide },
      { path: '*', Component: NotFound },
    ],
  },
]);
