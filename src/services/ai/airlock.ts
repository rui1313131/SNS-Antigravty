import { PrivacyRiskAssessment } from '../../../types';
import { scanForPII } from './scanner';
import { anonymize } from './anonymizer';
import { analyzePrivacyRisk as callGemini } from '../../../services/geminiService'; // Leveraging existing service as raw transport

export async function auditContent(draft: string): Promise<PrivacyRiskAssessment> {
  // 1. Local Sentry
  const localWarnings = scanForPII(draft);

  // If critical local PII found, we might warn immediately, 
  // but for Phase 13 we proceed to AI to get full context, 
  // utilizing anonymization.

  // 2. Anonymization (The Sandworm Defense)
  const { sanitizedText, tokenMap } = anonymize(draft);

  // 3. API Call (Through Airlock)
  // We send the SANITIZED text to the AI
  const aiAssessment = await callGemini(sanitizedText);

  // 4. Merge Results
  const mergedWarnings = [...localWarnings, ...aiAssessment.warnings];

  // Deduplicate
  const uniqueWarnings = Array.from(new Set(mergedWarnings));

  // Determine Source
  const source = localWarnings.length > 0 ? 'LOCAL' : 'AI';

  return {
    ...aiAssessment,
    warnings: uniqueWarnings,
    source
  };
}
