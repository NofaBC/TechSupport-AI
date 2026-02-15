import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionByToken,
  updateSessionStatus,
  isSessionValid,
} from '@/lib/visionscreen/session';

interface RouteParams {
  params: { token: string };
}

/**
 * Get VisionScreen session details by token
 * GET /api/visionscreen/[token]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if session is valid (not expired)
    if (!isSessionValid(session)) {
      return NextResponse.json(
        { 
          error: 'Session has expired',
          code: 'SESSION_EXPIRED',
          expiredAt: session.expiresAt,
        },
        { status: 410 }
      );
    }

    // Return session info (without sensitive data)
    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        mode: session.mode,
        expiresAt: session.expiresAt,
        metadata: {
          focusArea: session.metadata?.focusArea,
          reason: session.metadata?.reason,
        },
      },
      // Include WebRTC signaling info in production
      signaling: {
        // In production, this would include ICE servers, etc.
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });
  } catch (error) {
    console.error('VisionScreen token lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup session' },
      { status: 500 }
    );
  }
}

/**
 * Update VisionScreen session (join, end, etc.)
 * PATCH /api/visionscreen/[token]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params;
    const body = await request.json();
    const { action } = body; // 'join' | 'end'

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const session = await getSessionByToken(token);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!isSessionValid(session)) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    if (action === 'join') {
      // Mark session as active
      await updateSessionStatus(session.tenantId, session.id, 'active');
      
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: 'active',
          mode: session.mode,
        },
      });
    } else if (action === 'end') {
      // End the session
      await updateSessionStatus(session.tenantId, session.id, 'ended');
      
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          status: 'ended',
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "join" or "end"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('VisionScreen session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
