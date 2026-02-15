import { NextRequest, NextResponse } from 'next/server';
import {
  createVisionScreenSession,
  getActiveSessionsForCase,
  getSessionJoinUrl,
} from '@/lib/visionscreen/session';
import { addTimelineEvent } from '@/lib/firebase/cases';
import { sendSMS } from '@/lib/twilio/client';

/**
 * Create a new VisionScreen session
 * POST /api/visionscreen/session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      tenantId,
      caseId,
      agentId,
      customerPhone,
      mode = 'screen_share',
      focusArea,
      reason,
      sendSmsInvite = true,
    } = body;

    // Validate required fields
    if (!tenantId || !caseId) {
      return NextResponse.json(
        { error: 'tenantId and caseId are required' },
        { status: 400 }
      );
    }

    // Check for existing active sessions
    const activeSessions = await getActiveSessionsForCase(tenantId, caseId);
    if (activeSessions.length > 0) {
      // Return existing session instead of creating a new one
      const existingSession = activeSessions[0];
      return NextResponse.json({
        session: existingSession,
        joinUrl: getSessionJoinUrl(existingSession.token),
        isExisting: true,
      });
    }

    // Create new session
    const session = await createVisionScreenSession(tenantId, caseId, {
      agentId,
      customerPhone,
      mode,
      focusArea,
      reason,
    });

    const joinUrl = getSessionJoinUrl(session.token);

    // Log timeline event
    await addTimelineEvent(tenantId, caseId, {
      type: 'visionscreen_started',
      level: 'L2',
      content: `VisionScreen session created${reason ? `: ${reason}` : ''}`,
      metadata: {
        sessionId: session.id,
        mode,
        focusArea,
        expiresAt: session.expiresAt.toISOString(),
      },
      createdBy: agentId || 'ai',
    });

    // Send SMS invite if phone number provided
    if (sendSmsInvite && customerPhone) {
      try {
        const smsBody = `TechSupport AI needs to see your screen to help resolve your issue. Click this secure link to share your screen: ${joinUrl}\n\nThis link expires in 15 minutes.`;
        await sendSMS(customerPhone, smsBody);
        
        await addTimelineEvent(tenantId, caseId, {
          type: 'sms_sent',
          level: 'L2',
          content: 'VisionScreen invitation sent via SMS',
          metadata: {
            sessionId: session.id,
            phone: customerPhone.replace(/\d(?=\d{4})/g, '*'), // Mask phone
          },
          createdBy: 'system',
        });
      } catch (smsError) {
        console.error('Failed to send VisionScreen SMS:', smsError);
        // Don't fail the whole request if SMS fails
      }
    }

    return NextResponse.json({
      session: {
        id: session.id,
        token: session.token,
        status: session.status,
        mode: session.mode,
        expiresAt: session.expiresAt,
        metadata: session.metadata,
      },
      joinUrl,
      isExisting: false,
    });
  } catch (error) {
    console.error('VisionScreen session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create VisionScreen session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
