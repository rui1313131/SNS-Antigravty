import React from 'react';
import { SecurityConfig } from '../types';
import { Switch } from './Switch'; // Helper component we'll define inline for brevity if not complex, or separate.

// Simple Switch Component for this file
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string; description: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
    <div>
      <div className="text-sm font-medium text-slate-200">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </div>
    <button 
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

interface SecuritySettingsProps {
  config: SecurityConfig;
  onUpdate: (config: SecurityConfig) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ config, onUpdate }) => {
  const update = (key: keyof SecurityConfig, value: any) => {
    onUpdate({ ...config, [key]: value });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        Security Protocols
      </h2>
      
      <div className="space-y-2">
        <Toggle 
          label="Auto-Decrypt Feed" 
          description="Automatically decrypts posts in your feed using your private key. Disabling this improves privacy in public spaces."
          checked={config.autoDecrypt}
          onChange={(v) => update('autoDecrypt', v)}
        />
        
        <Toggle 
          label="Mandatory Risk Audit" 
          description="Prevents posting content that hasn't been scanned by the AI Security Agent."
          checked={config.requireRiskScan}
          onChange={(v) => update('requireRiskScan', v)}
        />

        <Toggle 
          label="Mask Usernames" 
          description="Replaces usernames with hashes in the UI to prevent shoulder-surfing identification."
          checked={config.maskUsernames}
          onChange={(v) => update('maskUsernames', v)}
        />
      </div>
      
      <div className="mt-8 p-4 bg-slate-950 rounded-lg border border-slate-900">
         <div className="text-xs font-mono text-slate-500 uppercase mb-2">System Status</div>
         <div className="flex items-center gap-2 text-green-500 text-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Encryption Module Active (AES-256-GCM Simulation)
         </div>
      </div>
    </div>
  );
};