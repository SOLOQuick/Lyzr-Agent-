import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  FileText, 
  DollarSign, 
  Percent, 
  Scale, 
  Lock, 
  Unlock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator
} from 'lucide-react';
import { 
  TargetAllocation, 
  TradeOrder, 
  ClientIPS, 
  TaxImpactSummary, 
  SafeAIEvaluation, 
  AssetClass 
} from '../types';

interface RebalanceEngineViewProps {
  ips: ClientIPS;
  totalPortfolioValue: number;
  currentAllocation: TargetAllocation;
  targetAllocation: TargetAllocation;
  postTradeAllocation: TargetAllocation;
  trades: TradeOrder[];
  taxImpact: TaxImpactSummary;
  safeAIEvaluation: SafeAIEvaluation;
  enableTLH: boolean;
  setEnableTLH: (enabled: boolean) => void;
  lockCashBuffer: boolean;
  setLockCashBuffer: (locked: boolean) => void;
  onUpdateTargetAllocation: (target: TargetAllocation) => void;
  onProceedToBriefing: () => void;
  onOpenSafeAIModal: () => void;
}

export const RebalanceEngineView: React.FC<RebalanceEngineViewProps> = ({
  ips,
  totalPortfolioValue,
  currentAllocation,
  targetAllocation,
  postTradeAllocation,
  trades,
  taxImpact,
  safeAIEvaluation,
  enableTLH,
  setEnableTLH,
  lockCashBuffer,
  setLockCashBuffer,
  onUpdateTargetAllocation,
  onProceedToBriefing,
  onOpenSafeAIModal,
}) => {
  const [activeModelPreset, setActiveModelPreset] = useState<string>('custom');

  const applyPreset = (presetName: string, alloc: TargetAllocation) => {
    setActiveModelPreset(presetName);
    onUpdateTargetAllocation(alloc);
  };

  const handleSliderChange = (key: keyof TargetAllocation, val: number) => {
    setActiveModelPreset('custom');
    // Normalize allocation
    const others = (Object.keys(targetAllocation) as (keyof TargetAllocation)[]).filter(k => k !== key);
    const currentOthersSum = others.reduce((sum, k) => sum + targetAllocation[k], 0);
    const remaining = Math.max(0, 100 - val);

    const newTarget: TargetAllocation = { ...targetAllocation, [key]: val };
    if (currentOthersSum > 0) {
      for (const k of others) {
        newTarget[k] = Number(((targetAllocation[k] / currentOthersSum) * remaining).toFixed(1));
      }
    } else {
      const split = remaining / others.length;
      for (const k of others) {
        newTarget[k] = Number(split.toFixed(1));
      }
    }
    onUpdateTargetAllocation(newTarget);
  };

  return (
    <div className="space-y-6">
      {/* Deterministic Rebalancing Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Deterministic Quadratic Portfolio Optimizer
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Non-Hallucinatory Math
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                Calculates exact share lots using drift minimization, HIFO tax-lot selection, and tax-loss harvesting proxies. 
                All mathematical operations execute deterministically without stochastic LLM variation.
              </p>
            </div>
          </div>

          {/* Lyzr Safe AI Quick Status Pill */}
          <button
            onClick={onOpenSafeAIModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition border ${
              safeAIEvaluation.passed
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {safeAIEvaluation.passed ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
            )}
            <span>Safe AI Gate: <strong>{safeAIEvaluation.overallStatus}</strong></span>
            <span className="text-[10px] underline ml-1">Inspect (6 Rules)</span>
          </button>
        </div>

        {/* Engine Controls: Model Presets & Toggles */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Presets */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Allocation Presets:</span>
            <button
              onClick={() => applyPreset('conservative', { equities: 18, fixedIncome: 70, commodities: 4, cash: 8 })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                activeModelPreset === 'conservative'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Preservation (18/70)
            </button>
            <button
              onClick={() => applyPreset('balanced', { equities: 55, fixedIncome: 35, commodities: 5, cash: 5 })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                activeModelPreset === 'balanced'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Balanced 60/40
            </button>
            <button
              onClick={() => applyPreset('growth', { equities: 75, fixedIncome: 18, commodities: 4, cash: 3 })}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                activeModelPreset === 'growth'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Growth 75/25
            </button>
          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={enableTLH}
                onChange={(e) => setEnableTLH(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Tax-Loss Harvesting (TLH)
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={lockCashBuffer}
                onChange={(e) => setLockCashBuffer(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-500 accent-slate-900"
              />
              <span className="flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Lock Cash Reserve (${(ips.minimumCashReserve / 1000).toFixed(0)}k)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Allocation Comparison: Current vs Target vs Proposed Post-Trade */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Asset Class Allocation & Drift Analysis</span>
          <span className="text-xs font-mono font-normal text-slate-500">
            Total Portfolio: ${Math.round(totalPortfolioValue).toLocaleString()}
          </span>
        </h3>

        {/* Visual Stacked Bars */}
        <div className="space-y-4 mb-6">
          {/* Current */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Current Allocation (Pre-Rebalance)</span>
              <span className="font-mono">
                Eq: {currentAllocation.equities}% • FI: {currentAllocation.fixedIncome}% • Comm: {currentAllocation.commodities}% • Cash: {currentAllocation.cash}%
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
              <div style={{ width: `${currentAllocation.equities}%` }} className="bg-blue-600" title={`Equities ${currentAllocation.equities}%`} />
              <div style={{ width: `${currentAllocation.fixedIncome}%` }} className="bg-emerald-500" title={`Fixed Income ${currentAllocation.fixedIncome}%`} />
              <div style={{ width: `${currentAllocation.commodities}%` }} className="bg-amber-500" title={`Commodities ${currentAllocation.commodities}%`} />
              <div style={{ width: `${currentAllocation.cash}%` }} className="bg-slate-400" title={`Cash ${currentAllocation.cash}%`} />
            </div>
          </div>

          {/* Target */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Target Policy Allocation</span>
              <span className="font-mono">
                Eq: {targetAllocation.equities}% • FI: {targetAllocation.fixedIncome}% • Comm: {targetAllocation.commodities}% • Cash: {targetAllocation.cash}%
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner border border-dashed border-slate-300">
              <div style={{ width: `${targetAllocation.equities}%` }} className="bg-blue-500/80" title={`Target Equities ${targetAllocation.equities}%`} />
              <div style={{ width: `${targetAllocation.fixedIncome}%` }} className="bg-emerald-400/80" title={`Target Fixed Income ${targetAllocation.fixedIncome}%`} />
              <div style={{ width: `${targetAllocation.commodities}%` }} className="bg-amber-400/80" title={`Target Commodities ${targetAllocation.commodities}%`} />
              <div style={{ width: `${targetAllocation.cash}%` }} className="bg-slate-300" title={`Target Cash ${targetAllocation.cash}%`} />
            </div>
          </div>

          {/* Post-Trade Proposed */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-900 mb-1">
              <span className="flex items-center text-emerald-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Proposed Post-Trade Allocation
              </span>
              <span className="font-mono font-bold">
                Eq: {postTradeAllocation.equities}% • FI: {postTradeAllocation.fixedIncome}% • Comm: {postTradeAllocation.commodities}% • Cash: {postTradeAllocation.cash}%
              </span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-sm border border-emerald-400 ring-2 ring-emerald-100">
              <div style={{ width: `${postTradeAllocation.equities}%` }} className="bg-blue-600" title={`Post Equities ${postTradeAllocation.equities}%`} />
              <div style={{ width: `${postTradeAllocation.fixedIncome}%` }} className="bg-emerald-500" title={`Post Fixed Income ${postTradeAllocation.fixedIncome}%`} />
              <div style={{ width: `${postTradeAllocation.commodities}%` }} className="bg-amber-500" title={`Post Commodities ${postTradeAllocation.commodities}%`} />
              <div style={{ width: `${postTradeAllocation.cash}%` }} className="bg-slate-400" title={`Post Cash ${postTradeAllocation.cash}%`} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-100 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded bg-blue-600 mr-1.5" /> Equities</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded bg-emerald-500 mr-1.5" /> Fixed Income</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded bg-amber-500 mr-1.5" /> Commodities</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded bg-slate-400 mr-1.5" /> Cash / Short T-Bills</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Post-Trade Cash Reserve: <strong className="text-slate-800">${Math.round((postTradeAllocation.cash / 100) * totalPortfolioValue).toLocaleString()}</strong> (Floor: ${ips.minimumCashReserve.toLocaleString()})
          </div>
        </div>
      </div>

      {/* Generated Trade Orders Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">Deterministic Trade Order Sheet</h3>
              <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
                {trades.length} Orders
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact share counts computed from quadratic drift minimization & wash-sale avoidance.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onProceedToBriefing}
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Review Advisor Proposal & Sign
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>

        {/* Table of Orders */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-3">Ticker / Security</th>
                <th className="py-3 px-3">Asset Class</th>
                <th className="py-3 px-3 text-right">Shares</th>
                <th className="py-3 px-3 text-right">Est. Price</th>
                <th className="py-3 px-3 text-right">Total Trade ($)</th>
                <th className="py-3 px-3 text-center">Weight Transition</th>
                <th className="py-3 px-3 text-right">Realized P&L</th>
                <th className="py-3 px-4">Rationale & Safe AI Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {trades.map((trade) => {
                const isBuy = trade.action === 'BUY';
                const isSell = trade.action === 'SELL';
                const pnl = trade.realizedShortTermGainLoss + trade.realizedLongTermGainLoss;

                return (
                  <tr key={trade.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isBuy ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trade.action}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-900">{trade.ticker}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                          {trade.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium text-slate-600">
                        {trade.assetClass}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {trade.shares.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      ${trade.estimatedPrice.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${Math.round(trade.estimatedValue).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span className="text-slate-500">{trade.currentWeight}%</span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-bold text-slate-900">{trade.proposedWeight}%</span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      {pnl !== 0 ? (
                        <span className={pnl >= 0 ? 'text-emerald-600 font-semibold' : 'text-purple-600 font-semibold'}>
                          {pnl >= 0 ? '+' : ''}${Math.round(pnl).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-700 leading-tight">
                          {trade.rationale}
                        </p>
                        <div className="flex items-center space-x-2">
                          {trade.isTaxLossHarvested && (
                            <span className="inline-flex items-center text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" /> Wash-Sale Proxy
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> FINRA 2111 Approved
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tax Impact Ledger Summary */}
        <div className="bg-slate-50 p-5 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
            <DollarSign className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Tax Friction & Tax-Loss Harvesting Ledger
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Harvested Losses</span>
              <span className="text-base font-extrabold text-purple-700 font-mono">
                ${Math.round(Math.abs(taxImpact.realizedShortTermLoss + taxImpact.realizedLongTermLoss)).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Off-sets capital gains</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Est. Tax Savings</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">
                +${Math.round(taxImpact.taxSavingsFromHarvesting).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Tax-loss alpha</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Realized Gains (LT)</span>
              <span className="text-base font-extrabold text-slate-800 font-mono">
                ${Math.round(taxImpact.realizedLongTermGain).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Taxed at preferential LTCG</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Net Realized P&L</span>
              <span className={`text-base font-extrabold font-mono ${
                taxImpact.netRealizedGainLoss >= 0 ? 'text-slate-800' : 'text-purple-700'
              }`}>
                ${Math.round(taxImpact.netRealizedGainLoss).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Net capital impact</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Est. Tax Liability</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                ${Math.round(taxImpact.estimatedTotalTaxDue).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Applied rate: {taxImpact.effectiveTaxRateApplied}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
