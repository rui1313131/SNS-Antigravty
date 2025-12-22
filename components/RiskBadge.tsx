import React from 'react';
import { PrivacyRiskAssessment } from '../types';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

export const RiskBadge: React.FC<{ assessment: PrivacyRiskAssessment }> = ({ assessment }) => {
  const { riskLevel, warnings } = assessment;

  const styles = {
    LOW: "bg-green-900/30 text-green-400 border-green-800",
    MEDIUM: "bg-yellow-900/30 text-yellow-400 border-yellow-800",
    HIGH: "bg-orange-900/30 text-orange-400 border-orange-800",
    CRITICAL: "bg-red-900/30 text-red-400 border-red-800",
  };

  const icon = {
    LOW: <ShieldCheck className="w-4 h-4" />,
    MEDIUM: <AlertTriangle className="w-4 h-4" />,
    HIGH: <ShieldAlert className="w-4 h-4" />,
    CRITICAL: <ShieldAlert className="w-4 h-4" />,
  };

  return (
    <div className={`border rounded-lg p-3 ${styles[riskLevel]} transition-all animate-in fade-in slide-in-from-top-2`}>
      <div className="flex items-center gap-2 font-bold mb-1">
        {icon[riskLevel]}
        <span>RISK LEVEL: {riskLevel}</span>
      </div>
      {warnings.length > 0 && (
        <ul className="list-disc list-inside text-xs opacity-90 space-y-1 mt-2">
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
};