export interface AnonymizedData {
  sanitizedText: string;
  tokenMap: Record<string, string>;
}

export const anonymize = (text: string): AnonymizedData => {
  const tokenMap: Record<string, string> = {};
  let counter = 0;

  // Simple Name Entity Recognition substitute (Mock for regex based)
  // In real implementaion, this would use a local NLP model or stricter regex
  // Here we assume Names start with Capital letters in middle of sentences for demo
  // Or just replace PII found by scanner.

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  const sanitizedText = text.replace(emailRegex, (match) => {
    counter++;
    const token = `[EMAIL_${counter}]`;
    tokenMap[token] = match;
    return token;
  });

  // Phone
  const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const sanitizedText2 = sanitizedText.replace(phoneRegex, (match) => {
    counter++;
    const token = `[PHONE_${counter}]`;
    tokenMap[token] = match;
    return token;
  });

  return { sanitizedText: sanitizedText2, tokenMap };
};

export const deAnonymize = (text: string, tokenMap: Record<string, string>): string => {
  let result = text;
  Object.entries(tokenMap).forEach(([token, original]) => {
    // Global replace of token
    result = result.split(token).join(original); 
  });
  return result;
};
