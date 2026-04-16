export interface FlowStep {
  label: string;
  path: string;
  description: string;
}

export interface Flow {
  id: string;
  label: string;
  emoji: string;
  steps: FlowStep[];
}

export const fanFlow: Flow = {
  id: 'fan',
  label: 'Fan Flow',
  emoji: '📈',
  steps: [
    { label: 'Home', path: '/', description: 'Landing page' },
    { label: 'Marketplace', path: '/marketplace', description: 'Browse creators' },
    { label: 'Creator', path: '/creator', description: 'Campaign details' },
    { label: 'Portfolio', path: '/portfolio', description: 'My investments' },
    { label: 'Statement', path: '/statement', description: 'Monthly payout' },
  ],
};

export const creatorFlow: Flow = {
  id: 'creator',
  label: 'Creator Flow',
  emoji: '🎥',
  steps: [
    { label: 'Onboard', path: '/onboard', description: 'Submit channel' },
    { label: 'Analysis', path: '/analysis', description: 'AI analyzing...' },
    { label: 'AI Report', path: '/report', description: 'Underwriting report' },
    { label: 'Campaign', path: '/campaign-setup', description: 'Set terms' },
    { label: 'Live!', path: '/campaign-live', description: 'Campaign published' },
  ],
};

export const allFlows = [fanFlow, creatorFlow];

export const allPaths = [
  ...fanFlow.steps.map(s => s.path),
  ...creatorFlow.steps.map(s => s.path),
  '/style-guide',
];

export function detectFlow(pathname: string): { flow: Flow | null; stepIndex: number } {
  const fanIdx = fanFlow.steps.findIndex(s => s.path === pathname);
  if (fanIdx >= 0) return { flow: fanFlow, stepIndex: fanIdx };

  const creatorIdx = creatorFlow.steps.findIndex(s => s.path === pathname);
  if (creatorIdx >= 0) return { flow: creatorFlow, stepIndex: creatorIdx };

  return { flow: null, stepIndex: -1 };
}
