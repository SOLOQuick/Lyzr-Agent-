import React, { useState } from 'react';
import { 
  Activity, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  CheckCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import { TargetAllocation } from '../types';
import { HISTORICAL_SCENARIOS, runStressSimulation } from '../utils/stressTestMath';

interface StressTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioValue: number;
  preAlloc: TargetAllocation;
  postAlloc: TargetAllocation;
}

export const StressTestModal: React.FC<StressTestModalProps> = ({
  isOpen,
  onClose,
  portfolioValue,
  preAlloc,
  postAlloc,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(HISTORICAL_SCENARIOS[0].id);

  if (!isOpen) return null;

  const currentScenario = HISTORICAL_SCENARIOS.find(s => s.id === selectedScenarioId) || HISTORICAL_SCENARIOS[0];
  const result = runStressSimulation(portfolioValue, preAlloc, postAlloc, currentScenario);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Macro Market-Shock Stress Tester
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Tail-Risk Simulation
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress-test current vs rebalanced portfolio under major historical market crises.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
          {HISTORICAL_SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[10px] font-mono block ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {sc.year}
                </span>
                <span className="text-xs font-bold block mt-0.5 leading-snug">
                  {sc.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scenario Description & Shocks Applied */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <span>{currentScenario.name} ({currentScenario.year})</span>
            </h4>
            <span className="font-mono text-slate-500">
              Simulated VIX: <strong className="text-rose-600">{currentScenario.volatilityVIX}</strong> • Inflation: <strong className="text-slate-700">{currentScenario.inflationShockPct}%</strong>
            </span>
          </div>
          <p className="text-slate-600 mb-3">
            {currentScenario.description}
          </p>

          <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Equities Shock</span>
              <strong className={currentScenario.equityShockPct < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {currentScenario.equityShockPct > 0 ? '+' : ''}{currentScenario.equityShockPct}%
              </strong>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Fixed Income Shock</span>
              <strong className={currentScenario.fixedIncomeShockPct < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {currentScenario.fixedIncomeShockPct > 0 ? '+' : ''}{currentScenario.fixedIncomeShockPct}%
              </strong>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Commodities Shock</span>
              <strong className={currentScenario.commodityShockPct < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {currentScenario.commodityShockPct > 0 ? '+' : ''}{currentScenario.commodityShockPct}%
              </strong>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-slate-400 block text-[10px]">Cash Yield</span>
              <strong className="text-slate-700">
                +{currentScenario.cashShockPct}%
              </strong>
            </div>
          </div>
        </div>

        {/* Comparative Results */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pre-Rebalance */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider">
                Unbalanced Portfolio (Current)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                Eq: {preAlloc.equities}% • FI: {preAlloc.fixedIncome}%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-extrabold text-rose-600 font-mono block">
                {result.preRebalanceImpact.portfolioPctChange}%
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Loss: ${Math.round(Math.abs(result.preRebalanceImpact.portfolioDollarChange)).toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Ending Portfolio Value:</span>
                <strong className="font-mono text-slate-900">${Math.round(result.preRebalanceImpact.endingValue).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Value at Risk (VaR 95%):</span>
                <strong className="font-mono text-rose-600">{result.preRebalanceImpact.var95Pct}%</strong>
              </div>
            </div>
          </div>

          {/* Post-Rebalance */}
          <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/20 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 uppercase tracking-wider flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Fiduciary Rebalanced (Post-Trade)
              </span>
              <span className="font-mono text-[11px] text-emerald-700">
                Eq: {postAlloc.equities}% • FI: {postAlloc.fixedIncome}%
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-2xl font-extrabold text-emerald-800 font-mono block">
                {result.postRebalanceImpact.portfolioPctChange}%
              </span>
              <span className="text-xs text-slate-600 font-mono">
                Drawdown: ${Math.round(Math.abs(result.postRebalanceImpact.portfolioDollarChange)).toLocaleString()}
              </span>
            </div>

            <div className="pt-2 border-t border-emerald-200 text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Ending Portfolio Value:</span>
                <strong className="font-mono text-slate-900">${Math.round(result.postRebalanceImpact.endingValue).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Value at Risk (VaR 95%):</span>
                <strong className="font-mono text-emerald-700">{result.postRebalanceImpact.var95Pct}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Preserved Capital Callout */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Estimated Capital Preserved by Rebalancing:</span>
              <strong className="text-lg font-extrabold text-emerald-400 font-mono">
                +${Math.round(Math.max(0, result.postRebalanceImpact.endingValue - result.preRebalanceImpact.endingValue)).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Resilience Score:</span>
            <span className="text-base font-extrabold text-white font-mono">
              {result.resilienceScore} <span className="text-xs text-slate-400">/ 100</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {result.notes}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
