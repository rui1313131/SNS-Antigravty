export const scanForPII = (text: string): string[] => {
  const warnings: string[] = [];
  
  // Regex Patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const ssRegex = /\b(?!000|666|9\d{2})([0-8]\d{2})[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g;

  if (emailRegex.test(text)) warnings.push("Email Address detected");
  if (phoneRegex.test(text)) warnings.push("Phone Number detected");
  if (ssRegex.test(text)) warnings.push("Social Security Number format detected");
  
  // Keyword scanning
  const sensitiveKeywords = ['password', 'secret', 'key', 'token', 'credit card'];
  sensitiveKeywords.forEach(kw => {
    if (text.toLowerCase().includes(kw)) warnings.push(`Sensitive keyword: "${kw}" detected`);
  });

  return warnings;
};
