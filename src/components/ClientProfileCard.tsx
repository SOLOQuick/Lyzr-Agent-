import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  DollarSign, 
  Clock, 
  Percent, 
  AlertCircle, 
  Sliders, 
  Check, 
  Info,
  X,
  Lock
} from 'lucide-react';
import { ClientIPS } from '../types';

interface ClientProfileCardProps {
  ips: ClientIPS;
  onUpdateIPS: (updated: ClientIPS) => void;
  totalPortfolioValue: number;
}

export const ClientProfileCard: React.FC<ClientProfileCardProps> = ({
  ips,
  onUpdateIPS,
  totalPortfolioValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ClientIPS>(ips);

  // Sync if ips prop changes externally (e.g. user selected different client)
  React.useEffect(() => {
    setEditForm(ips);
    setIsEditing(false);
  }, [ips.id]);

  const handleSave = () => {
    onUpdateIPS(editForm);
    setIsEditing(false);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score <= 6) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score <= 8) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
      {/* Top Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            {ips.clientName.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">{ips.clientName}</h2>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                {ips.accountNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                {ips.clientType}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {ips.occupation} • Age {ips.age} • Portfolio Value: <strong className="text-slate-800">${Math.round(totalPortfolioValue).toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              id="edit-ips-btn"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Adjust IPS & Risk Parameters
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                id="cancel-ips-btn"
                onClick={() => {
                  setEditForm(ips);
                  setIsEditing(false);
                }}
                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Cancel
              </button>
              <button
                id="save-ips-btn"
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs"
              >
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Apply Parameters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Parameters Grid */}
      <div className="p-5">
        {!isEditing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Risk Score */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">KYC Risk Score</span>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-extrabold text-slate-900">{ips.riskScore}</span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <div className="mt-1">
                <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${getRiskColor(ips.riskScore)}`}>
                  {ips.riskCategory}
                </span>
              </div>
            </div>

            {/* FINRA Equity Cap */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">FINRA Equity Cap</span>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-extrabold text-slate-900">≤ {ips.maxEquityLimitPct}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Rule 2111 Suitability Cap
              </p>
            </div>

            {/* Mandatory Cash Buffer */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cash Reserve Mandate</span>
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                ${(ips.minimumCashReserve / 1000).toFixed(0)}k
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ${(ips.annualLiquidityNeed / 1000).toFixed(0)}k/yr living need
              </p>
            </div>

            {/* Horizon */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Horizon</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {ips.investmentHorizonYears} <span className="text-sm font-normal text-slate-500">Yrs</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fiduciary glidepath
              </p>
            </div>

            {/* Tax Profile */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tax Friction Rate</span>
                <Percent className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                {(ips.federalTaxBracketPct + ips.stateTaxBracketPct).toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {ips.federalTaxBracketPct}% Fed + {ips.stateTaxBracketPct}% State
              </p>
            </div>

            {/* Single Stock Cap */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Single Security Cap</span>
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-extrabold text-slate-900">
                ≤ {ips.maxSingleSecurityLimitPct}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Concentration limit
              </p>
            </div>
          </div>
        ) : (
          /* Interactive IPS Editor */
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-indigo-600" /> Modify Investment Policy Statement (IPS) Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  KYC Risk Score (1 - 10):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editForm.riskScore}
                    onChange={(e) => {
                      const score = Number(e.target.value);
                      let cat: ClientIPS['riskCategory'] = 'Balanced Fiduciary';
                      let cap = 50;
                      if (score <= 3) { cat = 'Conservative Capital Preservation'; cap = 20; }
                      else if (score <= 5) { cat = 'Moderate Conservative'; cap = 45; }
                      else if (score <= 7) { cat = 'Balanced Fiduciary'; cap = 65; }
                      else if (score <= 8) { cat = 'Growth'; cap = 80; }
                      else { cat = 'Aggressive Growth'; cap = 90; }

                      setEditForm({
                        ...editForm,
                        riskScore: score,
                        riskCategory: cat,
                        maxEquityLimitPct: cap,
                      });
                    }}
                    className="w-full accent-slate-900 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-900 w-6 text-center">{editForm.riskScore}</span>
                </div>
                <span className="text-[11px] text-slate-500">{editForm.riskCategory}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  FINRA Max Equity Ceiling (%):
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={editForm.maxEquityLimitPct}
                  onChange={(e) => setEditForm({ ...editForm, maxEquityLimitPct: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-[11px] text-slate-500">Enforced by Lyzr Safe AI</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mandatory Cash Reserve ($):
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={editForm.minimumCashReserve}
                  onChange={(e) => setEditForm({ ...editForm, minimumCashReserve: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-[11px] text-slate-500">6-12 months liquidity floor</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Single-Stock Concentration Cap (%):
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={editForm.maxSingleSecurityLimitPct}
                  onChange={(e) => setEditForm({ ...editForm, maxSingleSecurityLimitPct: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-[11px] text-slate-500">Max % in single ticker (e.g. NVDA)</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Federal Tax Bracket (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={editForm.federalTaxBracketPct}
                  onChange={(e) => setEditForm({ ...editForm, federalTaxBracketPct: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  State Tax Bracket (%):
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  step="0.1"
                  value={editForm.stateTaxBracketPct}
                  onChange={(e) => setEditForm({ ...editForm, stateTaxBracketPct: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Capital Loss Carryforward ($):
                </label>
                <input
                  type="number"
                  step="1000"
                  value={editForm.capitalLossCarryforward}
                  onChange={(e) => setEditForm({ ...editForm, capitalLossCarryforward: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Horizon (Years):
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={editForm.investmentHorizonYears}
                  onChange={(e) => setEditForm({ ...editForm, investmentHorizonYears: Number(e.target.value) })}
                  className="w-full text-xs font-semibold p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Fiduciary Notes & Policy Mandates */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span><strong className="text-slate-800">IPS Mandate:</strong> {ips.notes}</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="font-semibold text-slate-500">Prohibited by Safe AI:</span>
            {ips.prohibitedAssetTypes.map((p, idx) => (
              <span key={idx} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                {p}
              </span>
            ))}
            {ips.esgExclusions.length > 0 && (
              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                ESG: {ips.esgExclusions.join(', ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
