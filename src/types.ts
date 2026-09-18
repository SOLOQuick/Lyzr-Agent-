export type AssetClass = 'Equities' | 'Fixed Income' | 'Commodities' | 'Cash';

export interface TaxLot {
  id: string;
  shares: number;
  costBasisPerShare: number;
  purchaseDate: string; // ISO date string
  isLongTerm: boolean; // > 1 year
}

export interface PortfolioHolding {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  subCategory: string; // e.g., 'US Large Cap', 'US Aggregate Bond', 'Short Treasury'
  shares: number;
  currentPrice: number;
  currentValue: number;
  weight: number; // percentage (0 - 100)
  costBasis: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPct: number;
  taxLots: TaxLot[];
  dividendYield: number;
  expenseRatio: number;
  isRestricted?: boolean;
  isSpeculative?: boolean;
  isLeveraged?: boolean;
}

export interface TargetAllocation {
  equities: number; // 0-100
  fixedIncome: number; // 0-100
  commodities: number; // 0-100
  cash: number; // 0-100
}

export interface ClientIPS {
  id: string;
  accountNumber: string;
  clientName: string;
  clientType: 'Individual' | 'Trust' | 'Retirement' | 'Corporate';
  age: number;
  occupation: string;
  riskScore: number; // 1 to 10
  riskCategory: 'Conservative Capital Preservation' | 'Moderate Conservative' | 'Balanced Fiduciary' | 'Growth' | 'Aggressive Growth';
  investmentHorizonYears: number;
  annualLiquidityNeed: number;
  minimumCashReserve: number;
  federalTaxBracketPct: number;
  stateTaxBracketPct: number;
  capitalLossCarryforward: number;
  maxEquityLimitPct: number; // e.g. ≤20% for conservative
  maxSingleSecurityLimitPct: number; // e.g. 10%
  esgExclusions: string[]; // e.g. ['Tobacco', 'Thermal Coal', 'Weapons']
  prohibitedAssetTypes: string[]; // e.g. ['Crypto / Meme Coins', 'Leveraged Inverse ETFs', 'Naked Options']
  notes: string;
}

export type TradeAction = 'BUY' | 'SELL' | 'HOLD';

export interface TradeOrder {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  action: TradeAction;
  shares: number;
  estimatedPrice: number;
  estimatedValue: number;
  currentWeight: number;
  proposedWeight: number;
  targetWeight: number;
  realizedShortTermGainLoss: number;
  realizedLongTermGainLoss: number;
  estimatedTaxFriction: number;
  rationale: string;
  isTaxLossHarvested?: boolean;
  replacementProxyTicker?: string;
  flaggedBySafeAI?: boolean;
  flagReason?: string;
}

export interface TaxImpactSummary {
  realizedShortTermGain: number;
  realizedShortTermLoss: number;
  realizedLongTermGain: number;
  realizedLongTermLoss: number;
  netRealizedGainLoss: number;
  taxSavingsFromHarvesting: number;
  estimatedTotalTaxDue: number;
  effectiveTaxRateApplied: number;
}

export type RuleStatus = 'PASS' | 'WARN' | 'FAIL';

export interface SuitabilityRuleCheck {
  id: string;
  code: string; // e.g. 'FINRA-2111-EQUITY-CAP'
  title: string;
  regulatoryStandard: 'FINRA Rule 2111 (Suitability)' | 'SEC Reg BI (Best Interest)' | 'Lyzr Safe AI Policy' | 'IRS Wash-Sale Rule 1091' | 'Custodial Cash Guardrail';
  description: string;
  thresholdApplied: string;
  actualObserved: string;
  status: RuleStatus;
  remediation?: string;
}

export interface SafeAIEvaluation {
  passed: boolean;
  overallStatus: 'APPROVED' | 'REQUIRES_REMEDIATION' | 'CRITICAL_VIOLATION';
  timestamp: string;
  engineVersion: string;
  ruleChecks: SuitabilityRuleCheck[];
  totalViolations: number;
  totalWarnings: number;
  aiGuardrailSummary: string;
}

export interface AIMSLogEntry {
  stepNumber: number;
  agentName: string;
  timestamp: string;
  status: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
  inputDataSummary: string;
  reasoningOutput: string;
  hashVerification: string;
}

export interface AIMSAuditRecord {
  id: string;
  blockNumber: number;
  timestamp: string;
  sha256Hash: string;
  previousBlockHash: string;
  clientAccountId: string;
  advisorId: string;
  advisorName: string;
  ipsVersion: string;
  portfolioPreValue: number;
  portfolioPostValue: number;
  safeAIVerdict: string;
  totalTradesProposed: number;
  taxImpactEst: number;
  reasoningSteps: AIMSLogEntry[];
  advisorSigned: boolean;
  signedAt?: string;
  custodianDispatchStatus: 'PENDING_SIGNATURE' | 'DISPATCHED_TO_CUSTODIAN' | 'REJECTED';
}

export interface StressScenario {
  id: string;
  name: string;
  year: string;
  description: string;
  equityShockPct: number;
  fixedIncomeShockPct: number;
  commodityShockPct: number;
  cashShockPct: number;
  inflationShockPct: number;
  volatilityVIX: number;
}

export interface StressTestResult {
  scenario: StressScenario;
  preRebalanceImpact: {
    portfolioDollarChange: number;
    portfolioPctChange: number;
    endingValue: number;
    maxDrawdownPct: number;
    var95Pct: number;
  };
  postRebalanceImpact: {
    portfolioDollarChange: number;
    portfolioPctChange: number;
    endingValue: number;
    maxDrawdownPct: number;
    var95Pct: number;
  };
  drawdownMitigationPct: number;
  resilienceScore: number; // 0-100
  notes: string;
}
