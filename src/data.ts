// Données de DÉMONSTRATION affichées dans la pub (aucun vrai compte). Tout se règle ici.
export const DEMO = {
  startBalance: 10000,
  currency: "EUR",
  accountName: "Main account",
  /** PnL cumulé après chaque trade : tendance haussière avec de vrais creux. */
  cumulative: [0, 48, 31, 96, 70, 122, 98, 80, 151, 205, 188, 246, 231, 289, 342, 318, 395, 372, 441, 468, 452, 529, 575, 601, 642.3],
  winRate: 58,
  profitFactor: 1.87,
  maxDrawdown: 3.2,
};

export const NET_PNL = DEMO.cumulative[DEMO.cumulative.length - 1];
export const TRADES = DEMO.cumulative.length - 1;
