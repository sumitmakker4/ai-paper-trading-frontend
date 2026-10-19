export const appRoutes = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    symbol: '◫',
    description: 'Your practice, in perspective.',
    empty: 'Your trading workspace starts here',
    detail:
      'Account balances and activity will appear after authentication and replay are connected.',
  },
  {
    path: 'markets',
    title: 'Markets',
    symbol: '⌕',
    description: 'Discover your next learning opportunity.',
    empty: 'Instrument discovery is coming',
    detail: 'Demo instruments and watchlists will be connected in project phase 3.',
  },
  {
    path: 'terminal',
    title: 'Terminal',
    symbol: '⌁',
    description: 'Study the chart. Understand the decision.',
    empty: 'No instrument selected',
    detail:
      'Replay-scoped charts arrive in project phase 4. Prices and candles are unavailable in this foundation preview.',
  },
  {
    path: 'paper',
    title: 'Paper Trading',
    symbol: '▣',
    description: 'Build experience with virtual capital.',
    empty: 'No replay connected',
    detail: 'Replay sessions and server-controlled virtual accounts arrive in project phase 4.',
  },
  {
    path: 'orders',
    title: 'Orders',
    symbol: '≡',
    description: 'Every decision, clearly recorded.',
    empty: 'Orders are not connected yet',
    detail:
      'Order submission remains unavailable until the backend execution and accounting checks pass.',
  },
  {
    path: 'portfolio',
    title: 'Portfolio',
    symbol: '◴',
    description: 'Understand your simulated performance.',
    empty: 'No portfolio data available',
    detail:
      'Balances, holdings and P&L will come from the backend. Nothing here represents a real portfolio.',
  },
  {
    path: 'journal',
    title: 'Journal',
    symbol: '▤',
    description: 'Turn your observations into lessons.',
    empty: 'Your journal is waiting',
    detail: 'Private notes and trade associations arrive in project phase 8.',
  },
  {
    path: 'settings',
    title: 'Settings',
    symbol: '⚙',
    description: 'A workspace that feels like yours.',
  },
];
