/**
 * AI Guardrails
 * Secret redaction, safety checks, and escalation triggers
 */

// Patterns for sensitive data that should be redacted
const SENSITIVE_PATTERNS = [
  // API Keys & Tokens
  { pattern: /(?:api[_-]?key|apikey)[=:\s]+['"]?([a-zA-Z0-9_\-]{20,})['"]?/gi, name: 'API Key' },
  { pattern: /(?:bearer|token)[:\s]+['"]?([a-zA-Z0-9_\-\.]{20,})['"]?/gi, name: 'Bearer Token' },
  { pattern: /sk-[a-zA-Z0-9]{32,}/gi, name: 'OpenAI API Key' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/gi, name: 'GitHub Token' },
  { pattern: /gho_[a-zA-Z0-9]{36}/gi, name: 'GitHub OAuth Token' },
  { pattern: /xox[baprs]-[a-zA-Z0-9\-]+/gi, name: 'Slack Token' },
  
  // AWS
  { pattern: /AKIA[A-Z0-9]{16}/gi, name: 'AWS Access Key' },
  { pattern: /(?:aws[_-]?secret|secret[_-]?key)[=:\s]+['"]?([a-zA-Z0-9\/+=]{40})['"]?/gi, name: 'AWS Secret' },
  
  // Passwords
  { pattern: /(?:password|passwd|pwd)[=:\s]+['"]?([^\s'"]{8,})['"]?/gi, name: 'Password' },
  { pattern: /(?:secret|credential)[=:\s]+['"]?([^\s'"]{8,})['"]?/gi, name: 'Secret' },
  
  // Credit Cards
  { pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g, name: 'Credit Card' },
  
  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'SSN' },
  
  // Private Keys
  { pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/gi, name: 'Private Key' },
  
  // Connection Strings
  { pattern: /(?:mongodb|mysql|postgresql|redis|amqp):\/\/[^\s]+/gi, name: 'Connection String' },
  
  // Email with password pattern
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}:[^\s]+/gi, name: 'Email:Password' },
];

// Keywords that should trigger escalation
const ESCALATION_KEYWORDS = [
  // Legal/Compliance
  'lawsuit', 'legal action', 'attorney', 'lawyer', 'sue', 'court',
  'compliance', 'regulation', 'gdpr', 'hipaa', 'pci', 'sox',
  
  // Security Incidents
  'breach', 'hack', 'compromised', 'unauthorized access', 'data leak',
  'ransomware', 'malware', 'phishing', 'security incident',
  
  // Billing Disputes
  'fraud', 'charge back', 'chargeback', 'dispute charge', 'unauthorized charge',
  'refund demand', 'cancel subscription', 'billing error',
  
  // Customer Frustration
  'speak to manager', 'supervisor', 'escalate', 'unacceptable',
  'terrible service', 'worst experience', 'never again',
  
  // Threats
  'social media', 'bad review', 'report you', 'bbb',
  
  // Urgency
  'emergency', 'urgent', 'critical', 'production down', 'outage',
];

export interface RedactionResult {
  text: string;
  redactions: Array<{
    type: string;
    original: string;
    position: number;
  }>;
  hasSecrets: boolean;
}

/**
 * Redact sensitive information from text
 */
export function redactSecrets(text: string): RedactionResult {
  let result = text;
  const redactions: RedactionResult['redactions'] = [];
  
  for (const { pattern, name } of SENSITIVE_PATTERNS) {
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const original = match[0];
      const replacement = `[REDACTED ${name}]`;
      
      redactions.push({
        type: name,
        original: original.substring(0, 4) + '...',
        position: match.index,
      });
      
      result = result.replace(original, replacement);
    }
  }
  
  return {
    text: result,
    redactions,
    hasSecrets: redactions.length > 0,
  };
}

export interface EscalationCheck {
  shouldEscalate: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Check if message contains escalation triggers
 */
export function checkEscalationTriggers(
  message: string,
  context?: {
    failedAttempts?: number;
    severity?: string;
    customerRequested?: boolean;
  }
): EscalationCheck {
  const reasons: string[] = [];
  let severity: EscalationCheck['severity'] = 'low';
  
  const lowerMessage = message.toLowerCase();
  
  // Check keyword triggers
  for (const keyword of ESCALATION_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      reasons.push(`Keyword detected: "${keyword}"`);
      
      // Increase severity based on keyword category
      if (['lawsuit', 'legal action', 'breach', 'hack', 'security incident'].some(
        (k) => keyword.toLowerCase().includes(k)
      )) {
        severity = 'critical';
      } else if (['compliance', 'fraud', 'emergency', 'production down'].some(
        (k) => keyword.toLowerCase().includes(k)
      )) {
        severity = 'high';
      } else if (severity !== 'critical' && severity !== 'high') {
        severity = 'medium';
      }
    }
  }
  
  // Check context-based triggers
  if (context) {
    if (context.failedAttempts && context.failedAttempts >= 3) {
      reasons.push('Multiple failed resolution attempts');
      if (severity === 'low') severity = 'medium';
    }
    
    if (context.severity === 'critical' || context.severity === 'high') {
      reasons.push(`Case severity: ${context.severity}`);
      severity = context.severity as 'high' | 'critical';
    }
    
    if (context.customerRequested) {
      reasons.push('Customer requested human agent');
      if (severity === 'low') severity = 'medium';
    }
  }
  
  return {
    shouldEscalate: reasons.length > 0,
    reasons,
    severity,
  };
}

/**
 * Validate AI response before sending
 */
export function validateAIResponse(response: string): {
  valid: boolean;
  issues: string[];
  sanitizedResponse: string;
} {
  const issues: string[] = [];
  let sanitized = response;
  
  // Check for leaked secrets in response
  const redaction = redactSecrets(response);
  if (redaction.hasSecrets) {
    issues.push('Response contained sensitive data that was redacted');
    sanitized = redaction.text;
  }
  
  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /\bi will hack\b/gi,
    /\bpassword is\b/gi,
    /\bhere's your api key\b/gi,
    /\byour credit card\b/gi,
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(response)) {
      issues.push('Response may contain inappropriate content');
      break;
    }
  }
  
  // Check response length
  if (response.length > 4000) {
    issues.push('Response exceeds recommended length');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    sanitizedResponse: sanitized,
  };
}

/**
 * Get safe actions that L1 can perform
 */
export function getSafeActions(): string[] {
  return [
    'lookup_documentation',
    'check_status',
    'send_verification_email',
    'reset_password_link',
    'create_ticket',
    'escalate_to_l2',
    'escalate_to_human',
    'provide_information',
    'guide_through_steps',
  ];
}

/**
 * Check if an action is safe for L1 to execute
 */
export function isActionSafe(action: string): boolean {
  const safeActions = getSafeActions();
  return safeActions.includes(action.toLowerCase());
}

/**
 * Dangerous actions that should NEVER be executed by AI
 */
export function getDangerousActions(): string[] {
  return [
    'delete_account',
    'delete_data',
    'modify_billing',
    'issue_refund',
    'change_subscription',
    'access_payment_info',
    'modify_permissions',
    'execute_code',
    'run_command',
  ];
}
