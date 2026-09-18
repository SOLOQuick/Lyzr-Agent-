import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  X, 
  ExternalLink,
  Lock,
  FileCheck,
  Scale
} from 'lucide-react';
import { SafeAIEvaluation } from '../types';

interface SafeAIGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: SafeAIEvaluation;
}

export const SafeAIGateModal: React.FC<SafeAIGateModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              evaluation.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {evaluation.passed ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Lyzr Safe AI — Fiduciary Suitability Gate
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  evaluation.passed
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {evaluation.overallStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {evaluation.engineVersion} • Timestamp: {new Date(evaluation.timestamp).toLocaleTimeString()}
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

        {/* Executive Fiduciary Summary */}
        <div className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed ${
          evaluation.passed
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start space-x-2">
            <Scale className="w-4 h-4 shrink-0 mt-0.5 text-slate-700" />
            <div>
              <strong className="font-bold">Fiduciary Compliance Audit Statement:</strong> {evaluation.aiGuardrailSummary}
            </div>
          </div>
        </div>

        {/* Individual Regulatory Rule Matrix */}
        <div className="mt-5 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Enforced Fiduciary Rules ({evaluation.ruleChecks.length})</span>
            <span>
              {evaluation.totalViolations} Violations • {evaluation.totalWarnings} Warnings
            </span>
          </div>

          {evaluation.ruleChecks.map((rule) => {
            const isPass = rule.status === 'PASS';
            const isWarn = rule.status === 'WARN';
            const isFail = rule.status === 'FAIL';

            return (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition ${
                  isFail
                    ? 'bg-rose-50/60 border-rose-300'
                    : isWarn
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-2.5">
                    <div className="mt-0.5">
                      {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {isWarn && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {isFail && <XCircle className="w-4 h-4 text-rose-600" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs">{rule.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {rule.code}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Standard: {rule.regulatoryStandard}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                    isPass
                      ? 'bg-emerald-100 text-emerald-800'
                      : isWarn
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rule.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2 pl-6">
                  {rule.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] pl-6">
                  <div>
                    <span className="text-slate-400 font-medium">Policy Threshold:</span>
                    <p className="font-semibold text-slate-700">{rule.thresholdApplied}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Observed Status:</span>
                    <p className="font-semibold text-slate-900">{rule.actualObserved}</p>
                  </div>
                </div>

                {rule.remediation && (
                  <div className="mt-2 pl-6 text-xs text-rose-700 font-semibold bg-rose-100/50 p-2 rounded-lg border border-rose-200 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span><strong>Required Remediation:</strong> {rule.remediation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verifiable audit record ready for SEC/FINRA examination</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
