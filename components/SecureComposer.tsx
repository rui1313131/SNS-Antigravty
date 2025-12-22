import React, { useState } from 'react';
import { Button } from './Button';
import { analyzePrivacyRisk } from '../services/geminiService';
import { PrivacyRiskAssessment } from '../types';
import { RiskBadge } from './RiskBadge';
import { Lock, ScanEye, Send } from 'lucide-react';

interface SecureComposerProps {
  onPost: (content: string, assessment: PrivacyRiskAssessment) => void;
  config: { requireRiskScan: boolean };
}

export const SecureComposer: React.FC<SecureComposerProps> = ({ onPost, config }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<PrivacyRiskAssessment | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzePrivacyRisk(text);
    setAssessment(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = () => {
    if (assessment && text) {
      onPost(text, assessment);
      setText('');
      setAssessment(null);
    }
  };

  const canPost = config.requireRiskScan ? (assessment !== null && assessment.safeToPost) : text.length > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-6">
      <div className="flex items-center gap-2 mb-3 text-slate-400 text-sm uppercase tracking-wider font-semibold">
        <Lock className="w-4 h-4" />
        Secure Composer
      </div>
      
      <textarea
        value={text}
        onChange={(e) => {
            setText(e.target.value);
            if(assessment) setAssessment(null); // Reset assessment on edit
        }}
        placeholder="Type your secure message..."
        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[120px] font-mono text-sm resize-y"
      />

      <div className="mt-4 space-y-4">
        {assessment && <RiskBadge assessment={assessment} />}

        <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">
                {text.length} characters • {assessment ? 'Audited' : 'Unchecked'}
            </span>
            <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAnalyze} 
                    isLoading={isAnalyzing}
                    disabled={!text.trim()}
                >
                    <ScanEye className="w-4 h-4 mr-2" />
                    Security Audit
                </Button>
                
                <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleSubmit} 
                    disabled={!canPost}
                >
                    <Send className="w-4 h-4 mr-2" />
                    Encrypt & Post
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
};