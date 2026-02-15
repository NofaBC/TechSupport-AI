import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface L3EscalationEmailData {
  caseId: string;
  caseNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  escalationReason: string;
  aiRecommendation?: string;
  dashboardUrl: string;
}

export async function sendL3EscalationEmail(
  to: string | string[],
  data: L3EscalationEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@techsupport-ai.com';

    const priorityColors: Record<string, string> = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      critical: '#7C3AED',
    };

    const priorityColor = priorityColors[data.priority] || '#6B7280';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚨 L3 Escalation Required</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
    <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">Case #${data.caseNumber}</h2>
      
      <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: white; background-color: ${priorityColor};">
        ${data.priority} Priority
      </div>
    </div>

    <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Customer</h3>
      <p style="margin: 0; font-size: 16px; font-weight: 500;">${data.customerName}</p>
      ${data.customerEmail ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${data.customerEmail}</p>` : ''}
      ${data.customerPhone ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${data.customerPhone}</p>` : ''}
    </div>

    <div style="background: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Issue Summary</h3>
      <p style="margin: 0;">${data.summary}</p>
    </div>

    <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #92400e; text-transform: uppercase;">Escalation Reason</h3>
      <p style="margin: 0; color: #78350f;">${data.escalationReason}</p>
    </div>

    ${data.aiRecommendation ? `
    <div style="background: #ede9fe; padding: 16px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #7c3aed;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #5b21b6; text-transform: uppercase;">AI Recommendation</h3>
      <p style="margin: 0; color: #4c1d95;">${data.aiRecommendation}</p>
    </div>
    ` : ''}

    <a href="${data.dashboardUrl}" style="display: block; text-align: center; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
      View Case in Dashboard →
    </a>
  </div>

  <div style="padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">TechSupport AI™ — Intelligent Support Command Center</p>
  </div>
</body>
</html>
`;

    const result = await resend.emails.send({
      from: `TechSupport AI <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject: `🚨 [${data.priority.toUpperCase()}] L3 Escalation: Case #${data.caseNumber}`,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    console.error('Email notification error:', message);
    return { success: false, error: message };
  }
}

export async function sendCaseAssignmentEmail(
  to: string,
  data: {
    caseId: string;
    caseNumber: string;
    assignedBy: string;
    dashboardUrl: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'support@techsupport-ai.com';

    const result = await resend.emails.send({
      from: `TechSupport AI <${fromEmail}>`,
      to,
      subject: `📋 Case #${data.caseNumber} assigned to you`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Case Assigned</h2>
          <p>Case #${data.caseNumber} has been assigned to you by ${data.assignedBy}.</p>
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Case</a>
        </div>
      `,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}
