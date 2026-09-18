import React, { useState, useMemo, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  ClientProfileCard 
} from './components/ClientProfileCard';
import { 
  HoldingsTable 
} from './components/HoldingsTable';
import { 
  RebalanceEngineView 
} from './components/RebalanceEngineView';
import { 
  SafeAIGateModal 
} from './components/SafeAIGateModal';
import { 
  AdvisorBriefingView 
} from './components/AdvisorBriefingView';
import { 
  AIMSComplianceLedgerModal 
} from './components/AIMSComplianceLedgerModal';
import { 
  StressTestModal 
} from './components/StressTestModal';
import { 
  MOCK_CLIENTS, 
  ClientDataBundle, 
  SPECULATIVE_TEST_ASSETS 
} from './data/mockClients';
import { 
  ClientIPS, 
  PortfolioHolding, 
  TargetAllocation, 
  AIMSAuditRecord 
} from './types';
import { 
  computeDeterministicRebalance, 
  calculateCurrentAllocation 
} from './utils/rebalancerMath';
import { 
  generateSHA256Hash 
} from './utils/cryptoHash';

export default function App() {
  const clientKeys = Object.keys(MOCK_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>('margaret-vance');

  // Client mutable state
  const [clientDataMap, setClientDataMap] = useState<Record<string, ClientDataBundle>>(MOCK_CLIENTS);

  const activeBundle = clientDataMap[selectedClientId] || clientDataMap['margaret-vance'];
  const ips = activeBundle.ips;
  const holdings = activeBundle.holdings;
  const targetAllocation = activeBundle.targetAllocation;

  // Rebalancing Toggles
  const [enableTLH, setEnableTLH] = useState<boolean>(true);
  const [lockCashBuffer, setLockCashBuffer] = useState<boolean>(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'rebalance' | 'holdings' | 'briefing' | 'aims'>('rebalance');

  // Modals
  const [isSafeAIModalOpen, setIsSafeAIModalOpen] = useState(false);
  const [isAIMSModalOpen, setIsAIMSModalOpen] = useState(false);
  const [isStressTestModalOpen, setIsStressTestModalOpen] = useState(false);

  // Execution & AIMS state
  const [isExecuted, setIsExecuted] = useState(false);
  const [aimsRecord, setAimsRecord] = useState<AIMSAuditRecord | null>(null);

  // Reset execution status when client changes
  useEffect(() => {
    setIsExecuted(false);
  }, [selectedClientId]);

  // Compute Deterministic Rebalance
  const rebalanceResult = useMemo(() => {
    return computeDeterministicRebalance(holdings, targetAllocation, ips, {
      enableTaxLossHarvesting: enableTLH,
      strictCashBuffer: lockCashBuffer,
    });
  }, [holdings, targetAllocation, ips, enableTLH, lockCashBuffer]);

  // Generate / Update Lyzr AIMS Audit Record
  useEffect(() => {
    let isMounted = true;
    async function updateAIMS() {
      const payloadString = JSON.stringify({
        account: ips.accountNumber,
        preValue: rebalanceResult.totalPortfolioValue,
        target: targetAllocation,
        tradesCount: rebalanceResult.trades.length,
        taxDue: rebalanceResult.taxImpact.estimatedTotalTaxDue,
        safeAIStatus: rebalanceResult.safeAIEvaluation.overallStatus,
        timestamp: rebalanceResult.safeAIEvaluation.timestamp,
      });

      const hash = await generateSHA256Hash(payloadString);
      const prevHash = await generateSHA256Hash(`BLOCK_${ips.accountNumber}_PREV_STATE`);

      if (!isMounted) return;

      const record: AIMSAuditRecord = {
        id: `aims-rec-${ips.accountNumber}-${Date.now()}`,
        blockNumber: 14820 + (ips.riskScore * 7),
        timestamp: new Date().toISOString(),
        sha256Hash: hash,
        previousBlockHash: prevHash,
        clientAccountId: ips.accountNumber,
        advisorId: 'ADV-RIA-8821',
        advisorName: 'Alexander Sterling, CFA, CFP®',
        ipsVersion: `v3.2 (Risk ${ips.riskScore}/10)`,
        portfolioPreValue: rebalanceResult.totalPortfolioValue,
        portfolioPostValue: rebalanceResult.totalPortfolioValue,
        safeAIVerdict: rebalanceResult.safeAIEvaluation.overallStatus,
        totalTradesProposed: rebalanceResult.trades.length,
        taxImpactEst: rebalanceResult.taxImpact.estimatedTotalTaxDue,
        advisorSigned: isExecuted,
        signedAt: isExecuted ? new Date().toISOString() : undefined,
        custodianDispatchStatus: isExecuted ? 'DISPATCHED_TO_CUSTODIAN' : 'PENDING_SIGNATURE',
        reasoningSteps: [
          {
            stepNumber: 1,
            agentName: 'Client & Market Ingest Agent',
            timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
            status: 'SUCCESS',
            inputDataSummary: `Loaded IPS for ${ips.clientName} (${ips.accountNumber}), ${holdings.length} tax lots, live asset prices.`,
            reasoningOutput: `Parsed portfolio value of $${Math.round(rebalanceResult.totalPortfolioValue).toLocaleString()}. Current allocation: ${rebalanceResult.currentAllocation.equities}% Equities, ${rebalanceResult.currentAllocation.fixedIncome}% Fixed Income. Identified ${holdings.filter(h => h.unrealizedGainLoss < -2000).length} loss tax-lots.`,
            hashVerification: `SHA256:${hash.slice(0, 16)}...VALID`,
          },
          {
            stepNumber: 2,
            agentName: 'Fiduciary Profiler & Macro Agent',
            timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
            status: 'SUCCESS',
            inputDataSummary: `Risk Score: ${ips.riskScore}/10, Horizon: ${ips.investmentHorizonYears}y, Living Needs: $${ips.annualLiquidityNeed.toLocaleString()}.`,
            reasoningOutput: `Derived fiduciary target allocation: ${targetAllocation.equities}% Equities, ${targetAllocation.fixedIncome}% FI, ${targetAllocation.commodities}% Commodities, ${targetAllocation.cash}% Cash. Enforced mandatory cash floor of $${ips.minimumCashReserve.toLocaleString()}.`,
            hashVerification: `SHA256:${hash.slice(16, 32)}...VALID`,
          },
          {
            stepNumber: 3,
            agentName: 'Tax-Aware Quadratic Optimizer',
            timestamp: new Date(Date.now() - 30000).toLocaleTimeString(),
            status: 'SUCCESS',
            inputDataSummary: `Non-hallucinatory quadratic drift minimization with HIFO lot selection.`,
            reasoningOutput: `Computed exact deterministic trade orders: ${rebalanceResult.trades.length} trades. Harvested $${Math.round(rebalanceResult.harvestedLossTotal).toLocaleString()} in capital losses. Estimated tax savings: $${Math.round(rebalanceResult.taxSavingsTotal).toLocaleString()}.`,
            hashVerification: `SHA256:${hash.slice(32, 48)}...VALID`,
          },
          {
            stepNumber: 4,
            agentName: 'Lyzr Safe AI Suitability Gate',
            timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
            status: rebalanceResult.safeAIEvaluation.passed ? 'SUCCESS' : 'BLOCKED',
            inputDataSummary: `FINRA Rule 2111, SEC Reg BI, Asset Blacklist, Single-Stock Diversification, Wash-Sale Rule 1091.`,
            reasoningOutput: rebalanceResult.safeAIEvaluation.aiGuardrailSummary,
            hashVerification: `SHA256:${hash.slice(48, 64)}...VALID`,
          },
          {
            stepNumber: 5,
            agentName: 'Advisor Supervisory Execution & AIMS Committal',
            timestamp: new Date().toLocaleTimeString(),
            status: isExecuted ? 'SUCCESS' : 'FLAGGED',
            inputDataSummary: isExecuted ? `Signed by Supervising Principal with 1-click execution.` : `Awaiting human advisor digital signature.`,
            reasoningOutput: isExecuted
              ? `Trade proposal officially authorized and dispatched to custodian (Schwab Institutional FIX API). Lyzr AIMS SEC audit block sealed.`
              : `Trade proposal staged in draft state for fiduciary review.`,
            hashVerification: `SHA256:SEALED-${Date.now().toString(16)}`,
          },
        ],
      };

      setAimsRecord(record);
    }

    updateAIMS();
    return () => {
      isMounted = false;
    };
  }, [ips, rebalanceResult, targetAllocation, isExecuted]);

  // Handlers
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleUpdateIPS = (updatedIPS: ClientIPS) => {
    setClientDataMap(prev => ({
      ...prev,
      [selectedClientId]: {
        ...prev[selectedClientId],
        ips: updatedIPS,
      },
    }));
  };

  const handleUpdateTargetAllocation = (newTarget: TargetAllocation) => {
    setClientDataMap(prev => ({
      ...prev,
      [selectedClientId]: {
        ...prev[selectedClientId],
        targetAllocation: newTarget,
      },
    }));
  };

  const handleAddHolding = (newHolding: PortfolioHolding) => {
    setClientDataMap(prev => ({
      ...prev,
      [selectedClientId]: {
        ...prev[selectedClientId],
        holdings: [newHolding, ...prev[selectedClientId].holdings],
      },
    }));
  };

  const handleRemoveHolding = (id: string) => {
    setClientDataMap(prev => ({
      ...prev,
      [selectedClientId]: {
        ...prev[selectedClientId],
        holdings: prev[selectedClientId].holdings.filter(h => h.id !== id),
      },
    }));
  };

  // Speculative asset injection to test Safe AI
  const handleInjectSpeculativeAsset = (asset: typeof SPECULATIVE_TEST_ASSETS[0]) => {
    const shares = 1000;
    const value = shares * asset.currentPrice;
    const specHolding: PortfolioHolding = {
      id: `spec-${Date.now()}`,
      ticker: asset.ticker,
      name: asset.name,
      assetClass: asset.assetClass,
      subCategory: asset.subCategory,
      shares,
      currentPrice: asset.currentPrice,
      currentValue: value,
      weight: 1.5,
      costBasis: value,
      unrealizedGainLoss: 0,
      unrealizedGainLossPct: 0,
      dividendYield: 0,
      expenseRatio: 0.95,
      isSpeculative: true,
      taxLots: [
        {
          id: `spec-lot-${Date.now()}`,
          shares,
          costBasisPerShare: asset.currentPrice,
          purchaseDate: new Date().toISOString().split('T')[0],
          isLongTerm: false,
        },
      ],
    };

    handleAddHolding(specHolding);
    setIsSafeAIModalOpen(true); // Open modal immediately to show Safe AI blocking it!
  };

  const handleDispatchToCustodian = (advisorSignature: string) => {
    setIsExecuted(true);
  };

  const allClientsList = Object.values(clientDataMap).map(c => c.ips);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentClient={ips}
        allClients={allClientsList}
        onSelectClient={handleSelectClient}
        onOpenStressTest={() => setIsStressTestModalOpen(true)}
        onOpenAIMS={() => setIsAIMSModalOpen(true)}
        onOpenComplianceMemo={() => setActiveTab('briefing')}
        safeAIPassed={rebalanceResult.safeAIEvaluation.passed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Client Profile Card */}
        <ClientProfileCard
          ips={ips}
          onUpdateIPS={handleUpdateIPS}
          totalPortfolioValue={rebalanceResult.totalPortfolioValue}
        />

        {/* Tab View Content */}
        {activeTab === 'rebalance' && (
          <RebalanceEngineView
            ips={ips}
            totalPortfolioValue={rebalanceResult.totalPortfolioValue}
            currentAllocation={rebalanceResult.currentAllocation}
            targetAllocation={targetAllocation}
            postTradeAllocation={rebalanceResult.postTradeAllocation}
            trades={rebalanceResult.trades}
            taxImpact={rebalanceResult.taxImpact}
            safeAIEvaluation={rebalanceResult.safeAIEvaluation}
            enableTLH={enableTLH}
            setEnableTLH={setEnableTLH}
            lockCashBuffer={lockCashBuffer}
            setLockCashBuffer={setLockCashBuffer}
            onUpdateTargetAllocation={handleUpdateTargetAllocation}
            onProceedToBriefing={() => setActiveTab('briefing')}
            onOpenSafeAIModal={() => setIsSafeAIModalOpen(true)}
          />
        )}

        {activeTab === 'holdings' && (
          <HoldingsTable
            holdings={holdings}
            ips={ips}
            totalPortfolioValue={rebalanceResult.totalPortfolioValue}
            onAddHolding={handleAddHolding}
            onRemoveHolding={handleRemoveHolding}
            onInjectSpeculativeAsset={handleInjectSpeculativeAsset}
          />
        )}

        {activeTab === 'briefing' && (
          <AdvisorBriefingView
            ips={ips}
            totalPortfolioValue={rebalanceResult.totalPortfolioValue}
            currentAllocation={rebalanceResult.currentAllocation}
            targetAllocation={targetAllocation}
            postTradeAllocation={rebalanceResult.postTradeAllocation}
            trades={rebalanceResult.trades}
            taxImpact={rebalanceResult.taxImpact}
            safeAIEvaluation={rebalanceResult.safeAIEvaluation}
            onDispatchToCustodian={handleDispatchToCustodian}
            isExecuted={isExecuted}
            aimsRecord={aimsRecord || undefined}
          />
        )}

        {activeTab === 'aims' && aimsRecord && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lyzr AIMS SEC Examination Ledger</h3>
                <p className="text-xs text-slate-500">Immutable Books and Records Cryptographic Chain</p>
              </div>
              <button
                onClick={() => setIsAIMSModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                Open Full Screen Explorer
              </button>
            </div>
            <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Block #{aimsRecord.blockNumber} Hash:</span>
                <span>{new Date(aimsRecord.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-emerald-400 font-bold break-all">
                {aimsRecord.sha256Hash}
              </div>
            </div>
            <div className="space-y-3">
              {aimsRecord.reasoningSteps.map((step) => (
                <div key={step.stepNumber} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-900 mb-1">
                    <span>0{step.stepNumber}. {step.agentName}</span>
                    <span className="text-emerald-700 font-mono text-[11px]">{step.status}</span>
                  </div>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 my-1 leading-relaxed">
                    {step.reasoningOutput}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">{step.hashVerification}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <SafeAIGateModal
        isOpen={isSafeAIModalOpen}
        onClose={() => setIsSafeAIModalOpen(false)}
        evaluation={rebalanceResult.safeAIEvaluation}
      />

      {aimsRecord && (
        <AIMSComplianceLedgerModal
          isOpen={isAIMSModalOpen}
          onClose={() => setIsAIMSModalOpen(false)}
          record={aimsRecord}
        />
      )}

      <StressTestModal
        isOpen={isStressTestModalOpen}
        onClose={() => setIsStressTestModalOpen(false)}
        portfolioValue={rebalanceResult.totalPortfolioValue}
        preAlloc={rebalanceResult.currentAllocation}
        postAlloc={rebalanceResult.postTradeAllocation}
      />
    </div>
  );
}
