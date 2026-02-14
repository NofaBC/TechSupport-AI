/**
 * Playbook System Types
 * Defines the structure for L1 support playbooks (runbooks)
 */

export interface PlaybookStep {
  id: string;
  title: string;
  instruction: string;
  expectedOutcome?: string;
  failureHint?: string;
  nextOnSuccess?: string;
  nextOnFailure?: string;
  escalateOnFailure?: boolean;
  requiresConfirmation?: boolean;
  maxAttempts?: number;
  timeout?: number; // seconds
}

export interface PlaybookTrigger {
  keywords?: string[];
  categories?: string[];
  products?: string[];
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  condition?: string; // JS expression for complex conditions
}

export interface PlaybookMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  product: string;
  category: string;
  language: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface Playbook {
  metadata: PlaybookMetadata;
  triggers: PlaybookTrigger;
  steps: PlaybookStep[];
  escalation: {
    defaultMessage: string;
    conditions: Array<{
      reason: string;
      message: string;
    }>;
  };
  variables?: Record<string, string>; // Template variables
}

export interface PlaybookExecutionState {
  playbookId: string;
  currentStepId: string;
  stepAttempts: Record<string, number>;
  completedSteps: string[];
  failedSteps: string[];
  startedAt: Date;
  lastUpdatedAt: Date;
  variables: Record<string, string>;
  outcome?: 'resolved' | 'escalated' | 'in_progress';
}

export interface PlaybookExecutionResult {
  success: boolean;
  stepId: string;
  stepTitle: string;
  outcome: 'success' | 'failure' | 'skipped' | 'timeout';
  message: string;
  nextStepId?: string;
  shouldEscalate: boolean;
  escalationReason?: string;
}

export interface PlaybookValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface PlaybookValidationResult {
  valid: boolean;
  errors: PlaybookValidationError[];
  warnings: PlaybookValidationError[];
}
