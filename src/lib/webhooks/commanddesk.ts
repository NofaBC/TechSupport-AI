/**
 * CommandDesk AI Webhook Integration
 * 
 * When a case is resolved in TechSupport AI, this module sends a callback
 * to CommandDesk AI so it can notify the customer via email.
 */

export interface CommandDeskWebhookPayload {
  caseId: string;
  ticketNumber: string;
  status: 'resolved' | 'pending' | 'escalated';
  responseToCustomer?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface CommandDeskWebhookResult {
  success: boolean;
  error?: string;
}

/**
 * Send a webhook callback to CommandDesk AI when a case is resolved.
 * This allows CommandDesk to send the resolution email to the customer.
 */
export async function notifyCommandDesk(
  payload: CommandDeskWebhookPayload
): Promise<CommandDeskWebhookResult> {
  const webhookUrl = process.env.COMMANDDESK_WEBHOOK_URL;
  const webhookSecret = process.env.COMMANDDESK_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.log('CommandDesk webhook not configured, skipping callback');
    return { success: true }; // Not an error, just not configured
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'techsupport-ai',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CommandDesk webhook failed:', response.status, errorText);
      return {
        success: false,
        error: `CommandDesk webhook error (${response.status}): ${errorText}`,
      };
    }

    const result = await response.json();
    console.log('CommandDesk webhook success:', result);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('CommandDesk webhook error:', message);
    return { success: false, error: message };
  }
}

/**
 * Generate a customer-friendly resolution message for the webhook.
 */
export function generateCustomerResponse(
  ticketNumber: string,
  resolutionSummary: string,
  product?: string,
  caseId?: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techsupport.nofabusinessconsulting.com';
  
  // Generate rating section if caseId is provided
  const ratingSection = caseId ? `
---

How would you rate this support experience?

⭐ Poor  ⭐⭐ Fair  ⭐⭐⭐ Good  ⭐⭐⭐⭐ Great  ⭐⭐⭐⭐⭐ Excellent

Click to rate:
[1 ⭐](${baseUrl}/api/rate?case=${caseId}&rating=1)  |  [2 ⭐⭐](${baseUrl}/api/rate?case=${caseId}&rating=2)  |  [3 ⭐⭐⭐](${baseUrl}/api/rate?case=${caseId}&rating=3)  |  [4 ⭐⭐⭐⭐](${baseUrl}/api/rate?case=${caseId}&rating=4)  |  [5 ⭐⭐⭐⭐⭐](${baseUrl}/api/rate?case=${caseId}&rating=5)
` : '';

  return `Dear Customer,

Your support case ${ticketNumber} has been resolved.

${resolutionSummary}

If you have any further questions or need additional assistance, please don't hesitate to reply to this email.

Thank you for choosing ${product || 'our services'}.
${ratingSection}
Best regards,
NOFA AI Technical Support Team`;
}
