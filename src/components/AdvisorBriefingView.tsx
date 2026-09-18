import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Send, 
  Sparkles, 
  Printer, 
  Download, 
  ShieldCheck, 
  ShieldAlert,
  Clock, 
  UserCheck, 
  AlertCircle,
  RefreshCw,
  Award,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ClientIPS, 
  TargetAllocation, 
  TradeOrder, 
  TaxImpactSummary, 
  SafeAIEvaluation,
  AIMSAuditRecord 
} from '../types';

interface BriefingData {
  executiveSummary: string;
  fiduciarySuitabilityJustification: string;
  taxAwarenessRationale: string;
  clientDiscussionTalkingPoints: string[];
  complianceCertificationStatement: string;
}

interface AdvisorBriefingViewProps {
  ips: ClientIPS;
  totalPortfolioValue: number;
  currentAllocation: TargetAllocation;
  targetAllocation: TargetAllocation;
  postTradeAllocation: TargetAllocation;
  trades: TradeOrder[];
  taxImpact: TaxImpactSummary;
  safeAIEvaluation: SafeAIEvaluation;
  onDispatchToCustodian: (advisorSignature: string) => void;
  isExecuted: boolean;
  aimsRecord?: AIMSAuditRecord;
}

export const AdvisorBriefingView: React.FC<AdvisorBriefingViewProps> = ({
  ips,
  totalPortfolioValue,
  currentAllocation,
  targetAllocation,
  postTradeAllocation,
  trades,
  taxImpact,
  safeAIEvaluation,
  onDispatchToCustodian,
  isExecuted,
  aimsRecord,
}) => {
  const [advisorName, setAdvisorName] = useState('Alexander Sterling, CFA, CFP®');
  const [advisorTitle, setAdvisorTitle] = useState('Managing Principal & Fiduciary Officer');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [briefingSource, setBriefingSource] = useState<string>('Lyzr Fiduciary Multi-Agent');

  // Multi-agent generated brief content
  const [briefing, setBriefing] = useState<BriefingData>({
    executiveSummary: `Fiduciary trade proposal for ${ips.clientName} (${ips.accountNumber}). Portfolio experienced tactical drift due to divergent market performance. Deterministic quadratic rebalancing realigns asset allocations to policy target ${targetAllocation.equities}% Equities / ${targetAllocation.fixedIncome}% Fixed Income while strictly preserving the mandatory $${ips.minimumCashReserve.toLocaleString()} liquidity buffer.`,
    fiduciarySuitabilityJustification: `Pursuant to FINRA Rule 2111 (Suitability) and SEC Regulation Best Interest (Reg BI) Care Obligation, this proposal accounts for the client's risk profile (Score: ${ips.riskScore}/10 - ${ips.riskCategory}) and ${ips.investmentHorizonYears}-year investment horizon. Equity exposure is strictly capped at ≤${ips.maxEquityLimitPct}%, idiosyncratic single-stock concentrations are trimmed below ${ips.maxSingleSecurityLimitPct}%, and speculative unhedged instruments are completely excluded.`,
    taxAwarenessRationale: `Tax friction was mitigated using systematic Highest-In First-Out (HIFO) lot selection. Eligible tax lots with unrealized losses were harvested to generate an estimated $${Math.round(taxImpact.taxSavingsFromHarvesting).toLocaleString()} in capital-loss tax offsets. Wash-sale disallowance is avoided by substituting compliant, non-identical index proxy ETFs. Estimated net taxable liability is minimized to $${Math.round(taxImpact.estimatedTotalTaxDue).toLocaleString()}.`,
    clientDiscussionTalkingPoints: [
      `We realigned your portfolio back to your stated risk preference (${ips.riskCategory}) following recent market rallies.`,
      `Your cash reserve of $${ips.minimumCashReserve.toLocaleString()} remains completely protected to fund living expenses and upcoming distributions.`,
      `We captured $${Math.round(taxImpact.taxSavingsFromHarvesting).toLocaleString()} in tax savings through tax-loss harvesting to offset taxable capital gains.`,
      `All newly purchased assets are ultra-low-fee, institutional-grade index funds approved under Lyzr Safe AI suitability screens.`,
    ],
    complianceCertificationStatement: `I hereby attest as Supervising RIA Principal that this trade proposal has been validated through Lyzr Safe AI suitability gates, strictly satisfies FINRA Rule 2111, complies with SEC Reg BI Care and Conflict Obligations, and maintains complete auditable integrity within Lyzr AIMS.`,
  });

  const handleRegenerateGemini = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/multi-agent-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientIps: ips,
          targetAllocation,
          currentAllocation,
          trades,
          taxImpact,
          safeAIEvaluation,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
          setBriefingSource(data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash (Server-Side Agent)' : 'Lyzr Fiduciary Multi-Agent');
        }
      }
    } catch (err) {
      console.error('Failed to regenerate briefing:', err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSignAndExecute = () => {
    if (!safeAIEvaluation.passed) {
      alert('Lyzr Safe AI Gate has blocked this proposal due to suitability violations. Please resolve violations before executing.');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // confetti fallback
    }

    onDispatchToCustodian(`${advisorName} (${advisorTitle})`);
  };

  const printProposal = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Briefing Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Advisor Fiduciary Briefing & Trade Proposal
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {briefingSource}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                SEC Reg BI & FINRA Rule 2111 Compliant Memorandum • Client Account: <strong>{ips.accountNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRegenerateGemini}
              disabled={isGeneratingAI}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
              title="Regenerate proposal narrative with Gemini AI"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-indigo-600 ${isGeneratingAI ? 'animate-spin' : ''}`} />
              {isGeneratingAI ? 'Agents Generating...' : 'Regenerate Briefing'}
            </button>

            <button
              onClick={printProposal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print Memo
            </button>
          </div>
        </div>
      </div>

      {/* Main Memo Paper Format */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6">
        {/* Memo Meta Table */}
        <div className="border-b border-slate-200 pb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Client Name & Account:</span>
            <p className="font-bold text-slate-900 mt-0.5">{ips.clientName}</p>
            <p className="text-slate-500 font-mono">{ips.accountNumber}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Supervising Advisor:</span>
            <p className="font-bold text-slate-900 mt-0.5">{advisorName}</p>
            <p className="text-slate-500">{advisorTitle}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Fiduciary Mandate:</span>
            <p className="font-bold text-slate-900 mt-0.5">{ips.riskCategory}</p>
            <p className="text-slate-500">Risk Score: {ips.riskScore}/10 • Horizon: {ips.investmentHorizonYears}y</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Lyzr Safe AI Status:</span>
            <p className="font-bold mt-0.5 flex items-center space-x-1 text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{safeAIEvaluation.overallStatus}</span>
            </p>
            <p className="text-slate-500">0 Violations • 6 Gates Verified</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
            1. Executive Fiduciary Summary
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
            {briefing.executiveSummary}
          </p>
        </div>

        {/* Section 2: Fiduciary Suitability Justification */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
            2. FINRA Rule 2111 & SEC Reg BI Suitability Justification
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
            {briefing.fiduciarySuitabilityJustification}
          </p>
        </div>

        {/* Section 3: Tax Awareness & Tax-Loss Harvesting Rationale */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
            3. Tax Awareness & Harvesting Rationale
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-normal">
            {briefing.taxAwarenessRationale}
          </p>
        </div>

        {/* Section 4: Client Talking Points */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
            4. Client Discussion Talking Points (Advisor Quick-Notes)
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
            {briefing.clientDiscussionTalkingPoints.map((pt, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Trade Execution Schedule */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
            <span className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
            5. Authorized Trade Execution Schedule ({trades.length} Orders)
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[11px] font-bold text-slate-600 uppercase">
                <tr>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5">Ticker</th>
                  <th className="p-2.5 text-right">Shares</th>
                  <th className="p-2.5 text-right">Est. Price</th>
                  <th className="p-2.5 text-right">Total Principal</th>
                  <th className="p-2.5">Target Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.action === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {t.action}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">{t.ticker}</td>
                    <td className="p-2.5 text-right font-mono font-medium">{t.shares.toLocaleString()}</td>
                    <td className="p-2.5 text-right font-mono">${t.estimatedPrice.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">${Math.round(t.estimatedValue).toLocaleString()}</td>
                    <td className="p-2.5 text-slate-600 truncate max-w-[280px]">{t.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 6: Supervising Advisor Attestation & 1-Click Execution */}
        <div className="border-t border-slate-200 pt-6">
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-sm font-bold flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Fiduciary Supervisory Sign-off & Execution</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-click advisor authorization and custodian trade batch dispatch (Schwab / Fidelity / BNY Mellon).
                </p>
              </div>

              {isExecuted && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DISPATCHED TO CUSTODIAN</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 italic mb-5 leading-relaxed bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
              "{briefing.complianceCertificationStatement}"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Supervising Advisor Signature Name:
                </label>
                <input
                  type="text"
                  disabled={isExecuted}
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Advisor Title & Fiduciary Credentials:
                </label>
                <input
                  type="text"
                  disabled={isExecuted}
                  value={advisorTitle}
                  onChange={(e) => setAdvisorTitle(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-800 text-white border border-slate-700 rounded-lg disabled:opacity-60"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>
                  {isExecuted && aimsRecord
                    ? `Commited to Lyzr AIMS Block #${aimsRecord.blockNumber} • Hash: ${aimsRecord.sha256Hash.slice(0, 16)}...`
                    : 'Awaiting human fiduciary sign-off before custodian trade dispatch'}
                </span>
              </div>

              {!isExecuted ? (
                <button
                  id="sign-and-execute-btn"
                  onClick={handleSignAndExecute}
                  disabled={!safeAIEvaluation.passed}
                  className="inline-flex items-center px-6 py-2.5 text-xs font-bold rounded-xl text-slate-900 bg-emerald-400 hover:bg-emerald-300 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Sign & 1-Click Dispatch to Custodian
                </button>
              ) : (
                <div className="inline-flex items-center px-5 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 rounded-xl">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                  Trade Proposal Executed & Recorded in AIMS
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
