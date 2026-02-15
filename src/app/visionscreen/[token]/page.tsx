'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VisionScreenViewer, VisionScreenControls } from '@/components/visionscreen';

interface SessionData {
  id: string;
  status: 'pending' | 'active' | 'ended' | 'expired';
  mode: 'screen_share' | 'camera';
  caseId: string;
  expiresAt: string;
  metadata?: {
    focusArea?: string;
    reason?: string;
  };
}

type PageStatus = 'loading' | 'ready' | 'active' | 'ended' | 'expired' | 'error';

export default function VisionScreenPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/visionscreen/${token}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Session not found. The link may be invalid.');
        } else if (response.status === 410) {
          setStatus('expired');
          setError('This session has expired.');
        } else {
          setError(data.error || 'Failed to load session');
        }
        setStatus('error');
        return;
      }

      setSession(data.session);
      
      if (data.session.status === 'ended') {
        setStatus('ended');
      } else if (data.session.status === 'expired') {
        setStatus('expired');
      } else if (data.session.status === 'active') {
        setStatus('active');
      } else {
        setStatus('ready');
      }
    } catch (err) {
      setError('Failed to connect. Please check your internet connection.');
      setStatus('error');
    }
  }, [token]);

  // Join session
  const joinSession = async () => {
    try {
      const response = await fetch(`/api/visionscreen/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to join session');
        return;
      }

      setStatus('active');
      if (session) {
        setSession({ ...session, status: 'active' });
      }
    } catch (err) {
      setError('Failed to join session');
    }
  };

  // End session
  const endSession = async () => {
    try {
      await fetch(`/api/visionscreen/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      setStatus('ended');
    } catch (err) {
      // Even if API fails, show ended locally
      setStatus('ended');
    }
  };

  useEffect(() => {
    if (token) {
      fetchSession();
    }
  }, [token, fetchSession]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>Loading session...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Session Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchSession} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This VisionScreen session has expired. Please contact support for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ended state
  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Ended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Thank you for using VisionScreen. Your support session has ended.
            </p>
            <p className="text-sm text-gray-500">
              You can close this window.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready to join state
  if (status === 'ready' && session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Join VisionScreen Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                A support agent has requested to see your{' '}
                {session.mode === 'screen_share' ? 'screen' : 'camera'} to help
                resolve your issue.
              </p>
            </div>

            {session.metadata?.reason && (
              <div>
                <p className="text-sm font-medium">Reason:</p>
                <p className="text-gray-600">{session.metadata.reason}</p>
              </div>
            )}

            {session.metadata?.focusArea && (
              <div>
                <p className="text-sm font-medium">Focus Area:</p>
                <p className="text-gray-600">{session.metadata.focusArea}</p>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Privacy Notice:</strong> Only share what you&apos;re comfortable
                with. You can end the session at any time.
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={joinSession} className="flex-1">
                Join Session
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              By joining, you agree to share your{' '}
              {session.mode === 'screen_share' ? 'screen' : 'camera'} with the
              support agent.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active session
  if (status === 'active' && session) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">VisionScreen Session</h1>
            <p className="text-gray-600">
              Sharing your {session.mode === 'screen_share' ? 'screen' : 'camera'}{' '}
              with support
            </p>
          </div>

          <VisionScreenViewer
            sessionId={session.id}
            mode={session.mode}
            isAgent={false}
            onEnd={endSession}
          />

          <VisionScreenControls
            sessionId={session.id}
            isAgent={false}
            onEndSession={endSession}
          />
        </div>
      </div>
    );
  }

  return null;
}
