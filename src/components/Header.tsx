import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  UserCheck, 
  FileText, 
  AlertTriangle,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { ClientIPS } from '../types';

interface HeaderProps {
  currentClient: ClientIPS;
  allClients: ClientIPS[];
  onSelectClient: (clientId: string) => void;
  onOpenStressTest: () => void;
  onOpenAIMS: () => void;
  onOpenComplianceMemo: () => void;
  safeAIPassed: boolean;
  activeTab: 'rebalance' | 'holdings' | 'briefing' | 'aims';
  setActiveTab: (tab: 'rebalance' | 'holdings' | 'briefing' | 'aims') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentClient,
  allClients,
  onSelectClient,
  onOpenStressTest,
  onOpenAIMS,
  onOpenComplianceMemo,
  safeAIPassed,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Utility & Institutional Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">SafeRebalance</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Lyzr Safe AI Active
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  SEC Reg BI & FINRA 2111
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Fiduciary Multi-Agent Portfolio Rebalancer & Deterministic Trade Engine
              </p>
            </div>
          </div>

          {/* Client Account Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 pl-2 pr-1 hidden sm:inline">Client Account:</span>
              <select
                id="client-selector"
                value={currentClient.id}
                onChange={(e) => onSelectClient(e.target.value)}
                aria-label="Select Client Account"
                className="bg-white text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
              >
                {allClients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.clientName} ({client.accountNumber} • Risk {client.riskScore}/10)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action Buttons */}
            <button
              id="stress-test-btn"
              onClick={onOpenStressTest}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
              title="Test portfolio against 2008 GFC, COVID, and 2022 Inflation shocks"
            >
              <Activity className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              <span className="hidden sm:inline">Market</span> Stress Tester
            </button>

            <button
              id="aims-audit-btn"
              onClick={onOpenAIMS}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
              title="View cryptographic SEC Exam ledger records"
            >
              <Database className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              <span className="hidden md:inline">Lyzr</span> AIMS Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Macro Status */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-1 py-1.5 overflow-x-auto" aria-label="Tabs">
            <button
              id="tab-rebalance"
              onClick={() => setActiveTab('rebalance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'rebalance'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Deterministic Rebalancer</span>
            </button>

            <button
              id="tab-holdings"
              onClick={() => setActiveTab('holdings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'holdings'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              <span>Current Holdings & Tax Lots</span>
            </button>

            <button
              id="tab-briefing"
              onClick={() => setActiveTab('briefing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'briefing'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Advisor Briefing & Trade Proposal</span>
              {!safeAIPassed && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              id="tab-aims"
              onClick={() => setActiveTab('aims')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
                activeTab === 'aims'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>AIMS SEC Audit Trail</span>
            </button>
          </nav>

          {/* Macro Regime Status Ticker */}
          <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-slate-500 py-1">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              S&P 500: <strong className="text-slate-700 ml-1 font-semibold">5,612 (+0.4%)</strong>
            </span>
            <span>
              10Y UST: <strong className="text-slate-700 font-semibold">4.18%</strong>
            </span>
            <span>
              VIX: <strong className="text-slate-700 font-semibold">15.2</strong>
            </span>
            <span className="bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded text-[11px] font-sans font-medium">
              Regime: Moderate Expansion
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
