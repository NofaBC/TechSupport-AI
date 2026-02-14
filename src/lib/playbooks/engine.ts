/**
 * Playbook Engine
 * Loads, validates, and executes support playbooks
 */

import {
  Playbook,
  PlaybookStep,
  PlaybookExecutionState,
  PlaybookExecutionResult,
  PlaybookValidationResult,
  PlaybookValidationError,
} from './types';

// In-memory playbook registry
const playbookRegistry: Map<string, Playbook> = new Map();

/**
 * Load a playbook from JSON
 */
export function loadPlaybook(json: unknown): Playbook {
  const playbook = json as Playbook;
  
  // Validate on load
  const validation = validatePlaybook(playbook);
  if (!validation.valid) {
    const errors = validation.errors.map((e) => e.message).join(', ');
    throw new Error(`Invalid playbook: ${errors}`);
  }
  
  return playbook;
}

/**
 * Register a playbook in the registry
 */
export function registerPlaybook(playbook: Playbook): void {
  playbookRegistry.set(playbook.metadata.id, playbook);
}

/**
 * Get a playbook by ID
 */
export function getPlaybook(id: string): Playbook | undefined {
  return playbookRegistry.get(id);
}

/**
 * Get all registered playbooks
 */
export function getAllPlaybooks(): Playbook[] {
  return Array.from(playbookRegistry.values());
}

/**
 * Find playbooks matching criteria
 */
export function findPlaybooks(criteria: {
  product?: string;
  category?: string;
  keywords?: string[];
}): Playbook[] {
  return getAllPlaybooks().filter((playbook) => {
    const triggers = playbook.triggers;
    
    // Check product match
    if (criteria.product && triggers.products) {
      if (!triggers.products.includes(criteria.product)) {
        return false;
      }
    }
    
    // Check category match
    if (criteria.category && triggers.categories) {
      if (!triggers.categories.includes(criteria.category)) {
        return false;
      }
    }
    
    // Check keyword match (any keyword)
    if (criteria.keywords && triggers.keywords) {
      const hasMatch = criteria.keywords.some((kw) =>
        triggers.keywords!.some((tk) =>
          tk.toLowerCase().includes(kw.toLowerCase()) ||
          kw.toLowerCase().includes(tk.toLowerCase())
        )
      );
      if (!hasMatch) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Validate a playbook structure
 */
export function validatePlaybook(playbook: Playbook): PlaybookValidationResult {
  const errors: PlaybookValidationError[] = [];
  const warnings: PlaybookValidationError[] = [];
  
  // Validate metadata
  if (!playbook.metadata) {
    errors.push({ path: 'metadata', message: 'Metadata is required', severity: 'error' });
  } else {
    if (!playbook.metadata.id) {
      errors.push({ path: 'metadata.id', message: 'Playbook ID is required', severity: 'error' });
    }
    if (!playbook.metadata.name) {
      errors.push({ path: 'metadata.name', message: 'Playbook name is required', severity: 'error' });
    }
    if (!playbook.metadata.version) {
      warnings.push({ path: 'metadata.version', message: 'Version is recommended', severity: 'warning' });
    }
  }
  
  // Validate steps
  if (!playbook.steps || playbook.steps.length === 0) {
    errors.push({ path: 'steps', message: 'At least one step is required', severity: 'error' });
  } else {
    const stepIds = new Set<string>();
    const referencedIds = new Set<string>();
    
    playbook.steps.forEach((step, index) => {
      const stepPath = `steps[${index}]`;
      
      if (!step.id) {
        errors.push({ path: `${stepPath}.id`, message: 'Step ID is required', severity: 'error' });
      } else if (stepIds.has(step.id)) {
        errors.push({ path: `${stepPath}.id`, message: `Duplicate step ID: ${step.id}`, severity: 'error' });
      } else {
        stepIds.add(step.id);
      }
      
      if (!step.title) {
        errors.push({ path: `${stepPath}.title`, message: 'Step title is required', severity: 'error' });
      }
      
      if (!step.instruction) {
        errors.push({ path: `${stepPath}.instruction`, message: 'Step instruction is required', severity: 'error' });
      }
      
      // Track referenced step IDs
      if (step.nextOnSuccess) referencedIds.add(step.nextOnSuccess);
      if (step.nextOnFailure) referencedIds.add(step.nextOnFailure);
    });
    
    // Check for unreachable steps
    referencedIds.forEach((refId) => {
      if (!stepIds.has(refId)) {
        errors.push({
          path: 'steps',
          message: `Referenced step ID does not exist: ${refId}`,
          severity: 'error',
        });
      }
    });
  }
  
  // Validate escalation
  if (!playbook.escalation) {
    warnings.push({ path: 'escalation', message: 'Escalation config is recommended', severity: 'warning' });
  } else if (!playbook.escalation.defaultMessage) {
    warnings.push({
      path: 'escalation.defaultMessage',
      message: 'Default escalation message is recommended',
      severity: 'warning',
    });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create initial execution state for a playbook
 */
export function createExecutionState(playbook: Playbook): PlaybookExecutionState {
  const firstStep = playbook.steps[0];
  
  return {
    playbookId: playbook.metadata.id,
    currentStepId: firstStep?.id || '',
    stepAttempts: {},
    completedSteps: [],
    failedSteps: [],
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
    variables: playbook.variables || {},
    outcome: 'in_progress',
  };
}

/**
 * Get the current step from execution state
 */
export function getCurrentStep(
  playbook: Playbook,
  state: PlaybookExecutionState
): PlaybookStep | undefined {
  return playbook.steps.find((s) => s.id === state.currentStepId);
}

/**
 * Execute a step and get the result
 */
export function executeStep(
  playbook: Playbook,
  state: PlaybookExecutionState,
  stepOutcome: 'success' | 'failure'
): PlaybookExecutionResult {
  const step = getCurrentStep(playbook, state);
  
  if (!step) {
    return {
      success: false,
      stepId: state.currentStepId,
      stepTitle: 'Unknown',
      outcome: 'failure',
      message: 'Step not found',
      shouldEscalate: true,
      escalationReason: 'Playbook step not found',
    };
  }
  
  // Update attempt count
  const attempts = (state.stepAttempts[step.id] || 0) + 1;
  state.stepAttempts[step.id] = attempts;
  state.lastUpdatedAt = new Date();
  
  // Check max attempts
  const maxAttempts = step.maxAttempts || 3;
  if (attempts > maxAttempts && stepOutcome === 'failure') {
    state.failedSteps.push(step.id);
    
    return {
      success: false,
      stepId: step.id,
      stepTitle: step.title,
      outcome: 'failure',
      message: `Step failed after ${attempts} attempts: ${step.failureHint || 'Unable to complete step'}`,
      shouldEscalate: step.escalateOnFailure ?? true,
      escalationReason: `Max attempts exceeded for step: ${step.title}`,
    };
  }
  
  if (stepOutcome === 'success') {
    state.completedSteps.push(step.id);
    
    // Determine next step
    const nextStepId = step.nextOnSuccess;
    if (nextStepId) {
      state.currentStepId = nextStepId;
    } else {
      // No next step = playbook complete
      state.outcome = 'resolved';
    }
    
    return {
      success: true,
      stepId: step.id,
      stepTitle: step.title,
      outcome: 'success',
      message: step.expectedOutcome || 'Step completed successfully',
      nextStepId,
      shouldEscalate: false,
    };
  } else {
    // Failure with remaining attempts
    const nextOnFailure = step.nextOnFailure;
    
    if (nextOnFailure) {
      state.currentStepId = nextOnFailure;
    }
    
    return {
      success: false,
      stepId: step.id,
      stepTitle: step.title,
      outcome: 'failure',
      message: step.failureHint || 'Step did not complete as expected',
      nextStepId: nextOnFailure,
      shouldEscalate: false, // Not yet, still have attempts or alternative path
    };
  }
}

/**
 * Check if playbook is complete
 */
export function isPlaybookComplete(state: PlaybookExecutionState): boolean {
  return state.outcome === 'resolved' || state.outcome === 'escalated';
}

/**
 * Get playbook progress percentage
 */
export function getPlaybookProgress(
  playbook: Playbook,
  state: PlaybookExecutionState
): number {
  const totalSteps = playbook.steps.length;
  const completedSteps = state.completedSteps.length;
  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Format step instruction with variables
 */
export function formatInstruction(
  instruction: string,
  variables: Record<string, string>
): string {
  let formatted = instruction;
  
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  
  return formatted;
}

/**
 * Get escalation message for a reason
 */
export function getEscalationMessage(
  playbook: Playbook,
  reason?: string
): string {
  if (!playbook.escalation) {
    return 'This issue requires human assistance.';
  }
  
  if (reason && playbook.escalation.conditions) {
    const condition = playbook.escalation.conditions.find(
      (c) => c.reason.toLowerCase() === reason.toLowerCase()
    );
    if (condition) {
      return condition.message;
    }
  }
  
  return playbook.escalation.defaultMessage;
}
