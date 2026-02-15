export { sendL3EscalationEmail, sendCaseAssignmentEmail } from './email';
export type { L3EscalationEmailData } from './email';

export { sendL3EscalationSlack, sendCaseAssignmentSlack } from './slack';
export type { SlackEscalationData } from './slack';

export interface NotifyL3EscalationParams {
  caseId: string;
  caseNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  escalationReason: string;
  aiRecommendation?: string;
  tenantId: string;
}

/**
 * Send L3 escalation notifications via all configured channels
 */
export async function notifyL3Escalation(
  params: NotifyL3EscalationParams,
  options: {
    emailRecipients?: string[];
    sendSlack?: boolean;
  } = {}
): Promise<{ email: boolean; slack: boolean; errors: string[] }> {
  const errors: string[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/en/dashboard/cases/${params.caseId}`;

  let emailSent = false;
  let slackSent = false;

  // Send email notifications
  if (options.emailRecipients && options.emailRecipients.length > 0) {
    const { sendL3EscalationEmail } = await import('./email');
    const result = await sendL3EscalationEmail(options.emailRecipients, {
      ...params,
      dashboardUrl,
    });
    emailSent = result.success;
    if (!result.success && result.error) {
      errors.push(`Email: ${result.error}`);
    }
  }

  // Send Slack notification
  if (options.sendSlack !== false) {
    const { sendL3EscalationSlack } = await import('./slack');
    const result = await sendL3EscalationSlack({
      ...params,
      dashboardUrl,
    });
    slackSent = result.success;
    if (!result.success && result.error) {
      errors.push(`Slack: ${result.error}`);
    }
  }

  return { email: emailSent, slack: slackSent, errors };
}
