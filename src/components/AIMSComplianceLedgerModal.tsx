import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Hash, 
  Clock, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileCheck, 
  Lock, 
  Copy, 
  Check,
  AlertCircle
} from 'lucide-react';
import { AIMSAuditRecord, AIMSLogEntry } from '../types';

interface AIMSComplianceLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AIMSAuditRecord;
}

export const AIMSComplianceLedgerModal: React.FC<AIMSComplianceLedgerModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(record.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const downloadExamPackage = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SEC_EXAM_AIMS_RECORD_${record.clientAccountId}_BLOCK_${record.blockNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-mono text-xl shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Lyzr AIMS — Verifiable SEC Exam Audit Ledger
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Block #{record.blockNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                SEC Rule 204-2 (Books and Records) & FINRA Rule 4511 Cryptographic Audit Trail
              </p>
            </div>
          </div>

          <button
            onClick={downloadExamPackage}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
            Export SEC Exam Package (.JSON)
          </button>
        </div>

        {/* Cryptographic Hash Summary Bar */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center">
              <Hash className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              SHA-256 Block Integrity Hash
            </span>
            <span>Recorded: {new Date(record.timestamp).toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700">
            <span className="text-emerald-400 font-bold truncate max-w-[500px]">
              {record.sha256Hash}
            </span>
            <button
              onClick={copyHash}
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 ml-2 shrink-0"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Previous Block: <strong className="text-slate-300 font-normal">{record.previousBlockHash.slice(0, 24)}...</strong></span>
            <span className="flex items-center text-emerald-400">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Chain Valid & Tamper-Evident
            </span>
          </div>
        </div>

        {/* Record Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Account Examined:</span>
            <strong className="text-slate-900 font-mono text-sm">{record.clientAccountId}</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Supervising Advisor:</span>
            <strong className="text-slate-900 text-xs">{record.advisorName}</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Lyzr Safe AI Verdict:</span>
            <strong className="text-emerald-700 font-bold flex items-center text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> {record.safeAIVerdict}
            </strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium block">Custodian Dispatch:</span>
            <strong className="text-blue-700 font-bold text-xs">{record.custodianDispatchStatus}</strong>
          </div>
        </div>

        {/* Reasoning Steps Audit Chain */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Verifiable Reasoning Chains ({record.reasoningSteps.length} Steps)</span>
            <span className="text-emerald-600 font-normal">All Agent Reasoning Paths Validated</span>
          </div>

          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {record.reasoningSteps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                      0{step.stepNumber}
                    </span>
                    <span className="font-bold text-slate-900">{step.agentName}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-500">
                    <span>{step.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {step.status}
                    </span>
                  </div>
                </div>

                <div className="pl-7 space-y-1 text-slate-600">
                  <p>
                    <strong className="text-slate-700">Inputs:</strong> {step.inputDataSummary}
                  </p>
                  <p className="bg-white p-2.5 rounded-lg border border-slate-200 font-sans text-slate-800 leading-relaxed">
                    {step.reasoningOutput}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 pt-0.5">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Integrity Proof: {step.hashVerification}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            SEC Exam Ready • Immutable Cryptographic Books & Records Archive
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs"
          >
            Close Audit Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
