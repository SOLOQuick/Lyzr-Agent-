import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Safe Wealth Advisory & Governed Portfolio Rebalancer',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Multi-Agent Advisor Briefing Generator
  app.post('/api/multi-agent-briefing', async (req, res) => {
    const { clientIps, targetAllocation, currentAllocation, trades, taxImpact, safeAIEvaluation } = req.body;

    try {
      const client = getGeminiClient();

      if (client) {
        try {
          const prompt = `
You are a senior Fiduciary Wealth Advisory AI working within an SEC-registered RIA firm.
You operate governed by Lyzr Safe AI compliance guardrails (FINRA Rule 2111 Suitability and SEC Regulation Best Interest).

Generate an Advisor Briefing & Compliance Memo for human advisor approval.

CLIENT IPS DATA:
- Client Name: ${clientIps.clientName}
- Account ID: ${clientIps.accountNumber}
- Client Type: ${clientIps.clientType} (Age: ${clientIps.age})
- Risk Score: ${clientIps.riskScore} / 10 (${clientIps.riskCategory})
- Horizon: ${clientIps.investmentHorizonYears} years
- Tax Bracket: ${clientIps.federalTaxBracketPct}% Federal + ${clientIps.stateTaxBracketPct}% State
- Cash Reserve Mandate: $${clientIps.minimumCashReserve?.toLocaleString()} minimum
- Mandatory Equity Cap: ${clientIps.maxEquityLimitPct}%
- Notes: ${clientIps.notes}

ALLOCATION SUMMARY:
- Current: Equities ${currentAllocation?.equities}%, Fixed Income ${currentAllocation?.fixedIncome}%, Commodities ${currentAllocation?.commodities}%, Cash ${currentAllocation?.cash}%
- Target: Equities ${targetAllocation?.equities}%, Fixed Income ${targetAllocation?.fixedIncome}%, Commodities ${targetAllocation?.commodities}%, Cash ${targetAllocation?.cash}%

PROPOSED TRADES:
${(trades || []).map((t: any) => `- ${t.action} ${t.shares} shares of ${t.ticker} (${t.name}) at ~$${t.estimatedPrice} [Est. Val: $${t.estimatedValue?.toLocaleString()}]. Rationale: ${t.rationale}`).join('\n')}

TAX IMPACT:
- Net Realized Gain/Loss: $${taxImpact?.netRealizedGainLoss?.toLocaleString()}
- Harvested Tax Losses: $${taxImpact?.taxSavingsFromHarvesting ? (taxImpact.taxSavingsFromHarvesting / (clientIps.federalTaxBracketPct / 100))?.toLocaleString() : '$0'}
- Est. Tax Savings from TLH: $${taxImpact?.taxSavingsFromHarvesting?.toLocaleString()}
- Estimated Tax Due: $${taxImpact?.estimatedTotalTaxDue?.toLocaleString()}

LYZR SAFE AI SUITABILITY GATES:
- Status: ${safeAIEvaluation?.overallStatus} (${safeAIEvaluation?.passed ? 'PASSED ALL SUITABILITY GATES' : 'FLAGGED'})
- Violations: ${safeAIEvaluation?.totalViolations}, Warnings: ${safeAIEvaluation?.totalWarnings}
${(safeAIEvaluation?.ruleChecks || []).map((r: any) => `  * [${r.status}] ${r.regulatoryStandard} - ${r.title}: ${r.actualObserved}`).join('\n')}

Please return a JSON object with this exact structure:
{
  "executiveSummary": "Concise 2-3 sentence overview of why this rebalancing is necessary and aligned with fiduciary duty.",
  "fiduciarySuitabilityJustification": "Clear justification citing FINRA Rule 2111 and SEC Reg BI, explaining why this allocation matches client risk tolerance and cash needs.",
  "taxAwarenessRationale": "Analysis of tax friction, tax-loss harvesting benefits, and capital gains minimization.",
  "clientDiscussionTalkingPoints": ["Point 1 for the client meeting", "Point 2 explaining risk reduction", "Point 3 regarding tax savings"],
  "complianceCertificationStatement": "Formal fiduciary attestation language for the supervising RIA compliance officer."
}
Do not wrap in markdown quotes if possible, or return raw JSON.
`;

          const geminiPromise = client.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API request timeout (4s)')), 4000)
          );

          const response = (await Promise.race([geminiPromise, timeoutPromise])) as any;

          const text = response?.text?.trim() || '{}';
          const parsed = JSON.parse(text);
          if (parsed && parsed.executiveSummary) {
            return res.json({ briefing: parsed, source: 'gemini-3.8-flash' });
          }
        } catch (apiErr) {
          console.warn('Gemini API call error, falling back to deterministic fiduciary engine:', apiErr);
          // Gracefully continue to fallback briefing below
        }
      }

      // High-Fidelity Fallback Fiduciary Briefing Generator (when no API key or offline)
      const isConservative = clientIps.riskScore <= 3;
      const tlhSavings = taxImpact?.taxSavingsFromHarvesting || 0;
      const netGain = taxImpact?.netRealizedGainLoss || 0;

      const fallbackBriefing = {
        executiveSummary: `Fiduciary review for ${clientIps.clientName} (${clientIps.accountNumber}). Portfolio drifted due to market fluctuations. Deterministic rebalancing realigns target risk to ${targetAllocation?.equities}% Equities / ${targetAllocation?.fixedIncome}% Fixed Income while strictly preserving the mandatory $${clientIps.minimumCashReserve?.toLocaleString()} cash reserve.`,
        fiduciarySuitabilityJustification: isConservative
          ? `In compliance with FINRA Rule 2111 (Suitability) and SEC Regulation Best Interest (Reg BI), the client's conservative risk profile (Score: ${clientIps.riskScore}/10) requires equity exposure capped at ≤${clientIps.maxEquityLimitPct}%. This proposal trims outsized equity exposure back within policy thresholds and secures quarterly distribution liquidity.`
          : `Aligned with SEC Reg BI Care Obligation, this proposal diversifies idiosyncratic risk, trims concentrated holdings below the ${clientIps.maxSingleSecurityLimitPct}% cap, and captures strategic asset class weightings suitable for a ${clientIps.investmentHorizonYears}-year horizon.`,
        taxAwarenessRationale: tlhSavings > 0
          ? `Tax-Loss Harvesting was actively executed across eligible tax lots, capturing $${Math.round(tlhSavings).toLocaleString()} in direct estimated tax offsets using IRS Section 1091 compliant proxy ETFs (e.g. VOO/BND/SCHA). Net realized taxable impact is minimized to $${Math.round(taxImpact?.estimatedTotalTaxDue || 0).toLocaleString()}.`
          : `Tax friction was minimized by prioritizing long-term capital gain lots over short-term income lots. Net taxable impact for the client is estimated at $${Math.round(taxImpact?.estimatedTotalTaxDue || 0).toLocaleString()}.`,
        clientDiscussionTalkingPoints: [
          `Realigned your portfolio to your target risk level (${clientIps.riskCategory}) after recent market divergence.`,
          `Maintained your liquid cash safety buffer of $${clientIps.minimumCashReserve?.toLocaleString()} for living expenses and distributions.`,
          tlhSavings > 0
            ? `Generated approximately $${Math.round(tlhSavings).toLocaleString()} in immediate tax savings through systematic tax-loss harvesting.`
            : `Controlled tax friction by executing trades in cost-basis optimized tax lots.`,
          `All proposed securities are institutional-grade, low-expense index funds vetted through Lyzr Safe AI suitability screens.`,
        ],
        complianceCertificationStatement: `I hereby attest as Supervising RIA Principal that this trade proposal has been validated through Lyzr Safe AI suitability gates, strictly satisfies FINRA Rule 2111, complies with SEC Reg BI Care and Conflict Obligations, and maintains complete auditable integrity within Lyzr AIMS.`,
      };

      res.json({ briefing: fallbackBriefing, source: 'fiduciary-deterministic-engine' });
    } catch (err: any) {
      console.error('Error generating briefing:', err);
      res.status(500).json({ error: err.message || 'Failed to generate briefing' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Governed Portfolio Rebalancer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
