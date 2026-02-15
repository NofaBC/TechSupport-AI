export interface SlackEscalationData {
  caseId: string;
  caseNumber: string;
  customerName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  escalationReason: string;
  aiRecommendation?: string;
  dashboardUrl: string;
}

const priorityEmojis: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
  critical: '🚨',
};

export async function sendL3EscalationSlack(
  data: SlackEscalationData
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return { success: true }; // Not an error, just not configured
  }

  try {
    const emoji = priorityEmojis[data.priority] || '⚪';

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} L3 Escalation: Case #${data.caseNumber}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Customer:*\n${data.customerName}`,
          },
          {
            type: 'mrkdwn',
            text: `*Priority:*\n${data.priority.toUpperCase()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Issue Summary:*\n${data.summary}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Escalation Reason:*\n${data.escalationReason}`,
        },
      },
    ];

    if (data.aiRecommendation) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*AI Recommendation:*\n${data.aiRecommendation}`,
        },
      });
    }

    blocks.push(
      {
        type: 'divider',
      } as never,
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Case',
              emoji: true,
            },
            url: data.dashboardUrl,
            style: 'primary',
          },
        ],
      } as never
    );

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks,
        text: `L3 Escalation: Case #${data.caseNumber} - ${data.priority.toUpperCase()} priority`,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: `Slack API error: ${text}` };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send Slack notification';
    console.error('Slack notification error:', message);
    return { success: false, error: message };
  }
}

export async function sendCaseAssignmentSlack(data: {
  caseNumber: string;
  assignedTo: string;
  assignedBy: string;
  dashboardUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return { success: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📋 *Case #${data.caseNumber}* assigned to *${data.assignedTo}* by ${data.assignedBy}`,
            },
            accessory: {
              type: 'button',
              text: { type: 'plain_text', text: 'View' },
              url: data.dashboardUrl,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      return { success: false, error: 'Slack API error' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' };
  }
}
