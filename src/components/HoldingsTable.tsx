import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  ShieldAlert, 
  DollarSign, 
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { PortfolioHolding, AssetClass, ClientIPS } from '../types';
import { SPECULATIVE_TEST_ASSETS } from '../data/mockClients';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  ips: ClientIPS;
  totalPortfolioValue: number;
  onAddHolding: (holding: PortfolioHolding) => void;
  onRemoveHolding: (id: string) => void;
  onInjectSpeculativeAsset: (asset: typeof SPECULATIVE_TEST_ASSETS[0]) => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  ips,
  totalPortfolioValue,
  onAddHolding,
  onRemoveHolding,
  onInjectSpeculativeAsset,
}) => {
  const [expandedHoldingId, setExpandedHoldingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [newName, setNewName] = useState('');
  const [newAssetClass, setNewAssetClass] = useState<AssetClass>('Equities');
  const [newShares, setNewShares] = useState(100);
  const [newPrice, setNewPrice] = useState(50);
  const [newCostBasis, setNewCostBasis] = useState(4500);

  const toggleExpand = (id: string) => {
    setExpandedHoldingId(expandedHoldingId === id ? null : id);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newName) return;
    const value = newShares * newPrice;
    const pnl = value - newCostBasis;
    const pnlPct = newCostBasis > 0 ? (pnl / newCostBasis) * 100 : 0;

    const newH: PortfolioHolding = {
      id: `custom-${Date.now()}`,
      ticker: newTicker.toUpperCase(),
      name: newName,
      assetClass: newAssetClass,
      subCategory: `${newAssetClass} Holding`,
      shares: newShares,
      currentPrice: newPrice,
      currentValue: value,
      weight: (value / (totalPortfolioValue + value)) * 100,
      costBasis: newCostBasis,
      unrealizedGainLoss: pnl,
      unrealizedGainLossPct: pnlPct,
      dividendYield: 1.5,
      expenseRatio: 0.1,
      taxLots: [
        {
          id: `lot-${Date.now()}`,
          shares: newShares,
          costBasisPerShare: newCostBasis / newShares,
          purchaseDate: new Date().toISOString().split('T')[0],
          isLongTerm: false,
        },
      ],
    };

    onAddHolding(newH);
    setShowAddModal(false);
    setNewTicker('');
    setNewName('');
  };

  const getAssetClassBadge = (ac: AssetClass) => {
    switch (ac) {
      case 'Equities':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fixed Income':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Commodities':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cash':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Current Portfolio Holdings & Tax Lots</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {holdings.length} Positions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit unrealized capital gains, tax lots, and single-stock concentration risks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Speculative Asset Injection Dropdown to test Safe AI */}
          <div className="relative group">
            <button
              id="inject-speculative-btn"
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              Test Safe AI Interception
              <ChevronDown className="w-3 h-3 ml-1 text-rose-500" />
            </button>
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl border border-slate-200 shadow-lg p-2 z-20 hidden group-hover:block transition-all">
              <div className="px-2 py-1 border-b border-slate-100 mb-1">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Simulate Prohibited Assets:
                </span>
                <p className="text-[10px] text-slate-500">
                  Inject out-of-policy assets to observe Lyzr Safe AI FINRA/SEC blocking gates.
                </p>
              </div>
              {SPECULATIVE_TEST_ASSETS.map((spec) => (
                <button
                  key={spec.ticker}
                  onClick={() => onInjectSpeculativeAsset(spec)}
                  className="w-full text-left p-2 rounded-lg hover:bg-rose-50/70 transition flex items-start space-x-2 border border-transparent hover:border-rose-100"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <span>{spec.ticker}</span>
                      <span className="text-[10px] font-normal text-slate-500">({spec.subCategory})</span>
                    </div>
                    <p className="text-[10px] text-rose-600 leading-tight mt-0.5">
                      {spec.reason.slice(0, 75)}...
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            id="add-custom-holding-btn"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Security
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Security / Asset</th>
              <th className="py-3 px-3">Asset Class</th>
              <th className="py-3 px-3 text-right">Shares</th>
              <th className="py-3 px-3 text-right">Price</th>
              <th className="py-3 px-3 text-right">Market Value</th>
              <th className="py-3 px-3 text-right">Weight</th>
              <th className="py-3 px-3 text-right">Cost Basis</th>
              <th className="py-3 px-4 text-right">Unrealized P&L</th>
              <th className="py-3 px-3 text-center">Fiduciary Notes</th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {holdings.map((h) => {
              const weight = (h.shares * h.currentPrice) / totalPortfolioValue * 100;
              const isConcentrated = weight > ips.maxSingleSecurityLimitPct && h.subCategory.includes('Single Stock');
              const isLossLot = h.unrealizedGainLoss < -2000;
              const isExpanded = expandedHoldingId === h.id;

              return (
                <React.Fragment key={h.id}>
                  <tr className={`hover:bg-slate-50/80 transition ${h.isSpeculative ? 'bg-rose-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleExpand(h.id)}
                          className="text-slate-400 hover:text-slate-600 focus:outline-hidden"
                          title="View Tax Lots"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-900">{h.ticker}</span>
                            {h.isSpeculative && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                PROHIBITED
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                            {h.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getAssetClassBadge(h.assetClass)}`}>
                        {h.assetClass}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                      {h.shares.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      ${h.currentPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${Math.round(h.shares * h.currentPrice).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-bold ${isConcentrated ? 'text-rose-600' : 'text-slate-800'}`}>
                          {weight.toFixed(1)}%
                        </span>
                        {isConcentrated && (
                          <span className="text-[10px] text-rose-600 font-semibold flex items-center">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Exceeds {ips.maxSingleSecurityLimitPct}% cap
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ${Math.round(h.costBasis).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-mono font-semibold flex items-center ${
                          h.unrealizedGainLoss >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {h.unrealizedGainLoss >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1 text-rose-600" />
                          )}
                          ${Math.abs(Math.round(h.unrealizedGainLoss)).toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-mono ${
                          h.unrealizedGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {h.unrealizedGainLoss >= 0 ? '+' : ''}{h.unrealizedGainLossPct.toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isLossLot ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Sparkles className="w-2.5 h-2.5 mr-1" /> TLH Candidate
                        </span>
                      ) : isConcentrated ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Trim Target
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Core Fiduciary</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onRemoveHolding(h.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Remove position"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Tax Lots Breakdown */}
                  {isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={10} className="py-3 px-6">
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-slate-800 flex items-center">
                              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                              Tax Lots for {h.ticker} ({h.name})
                            </h4>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Sub-Category: {h.subCategory} • Dividend Yield: {h.dividendYield}% • Expense Ratio: {h.expenseRatio}%
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {h.taxLots.map((lot, idx) => {
                              const lotVal = lot.shares * h.currentPrice;
                              const lotCost = lot.shares * lot.costBasisPerShare;
                              const lotPnl = lotVal - lotCost;
                              return (
                                <div key={lot.id || idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-slate-700">Lot #{idx + 1}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                      lot.isLongTerm ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {lot.isLongTerm ? 'Long-Term (>1yr)' : 'Short-Term (<1yr)'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 space-y-0.5">
                                    <p>Acquired: <strong className="text-slate-800">{lot.purchaseDate}</strong></p>
                                    <p>Shares: <strong className="text-slate-800">{lot.shares}</strong> @ ${lot.costBasisPerShare.toFixed(2)}/sh</p>
                                    <p>Lot P&L: <strong className={lotPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                      {lotPnl >= 0 ? '+' : ''}${Math.round(lotPnl).toLocaleString()}
                                    </strong></p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Security Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Security to Portfolio</h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate new position entry to test deterministic rebalancer and Safe AI suitability gates.
            </p>

            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticker Symbol:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VTI, MSFT, BND"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="w-full text-xs font-mono uppercase p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Security Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vanguard Total Stock Market ETF"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Class:</label>
                <select
                  value={newAssetClass}
                  onChange={(e) => setNewAssetClass(e.target.value as AssetClass)}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Equities">Equities</option>
                  <option value="Fixed Income">Fixed Income</option>
                  <option value="Commodities">Commodities</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Share Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={newShares}
                    onChange={(e) => setNewShares(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Price ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cost Basis ($):</label>
                <input
                  type="number"
                  step="1"
                  value={newCostBasis}
                  onChange={(e) => setNewCostBasis(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Add Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
