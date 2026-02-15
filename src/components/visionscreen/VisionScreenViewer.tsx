'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface VisionScreenViewerProps {
  sessionId: string;
  mode: 'screen_share' | 'camera';
  isAgent?: boolean; // true = viewing, false = sharing
  onEnd?: () => void;
  onError?: (error: string) => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function VisionScreenViewer({
  sessionId,
  mode,
  isAgent = false,
  onEnd,
  onError,
}: VisionScreenViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start screen share or camera
  const startMedia = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      let mediaStream: MediaStream;

      if (mode === 'screen_share') {
        // Request screen share
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      } else {
        // Request camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Back camera preferred for showing screen
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      }

      setStream(mediaStream);
      setStatus('connected');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Handle stream end (user stops sharing)
      mediaStream.getTracks().forEach((track) => {
        track.onended = () => {
          setStatus('disconnected');
          onEnd?.();
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start media';
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    }
  }, [mode, onEnd, onError]);

  // Stop media stream
  const stopMedia = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setStatus('disconnected');
    onEnd?.();
  }, [stream, onEnd]);

  // Auto-start for customer (non-agent)
  useEffect(() => {
    if (!isAgent) {
      startMedia();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAgent, startMedia, stream]);

  const statusColors: Record<ConnectionStatus, string> = {
    connecting: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    disconnected: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<ConnectionStatus, string> = {
    connecting: 'Connecting...',
    connected: 'Live',
    disconnected: 'Disconnected',
    error: 'Error',
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          {mode === 'screen_share' ? 'Screen Share' : 'Camera View'}
        </CardTitle>
        <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
      </CardHeader>
      <CardContent>
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {status === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                <p>Starting {mode === 'screen_share' ? 'screen share' : 'camera'}...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center p-4">
                <p className="text-red-400 mb-2">⚠️ {error}</p>
                <Button onClick={startMedia} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {status === 'disconnected' && !isAgent && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <p className="mb-2">Session ended</p>
                <Button onClick={startMedia} variant="outline" size="sm">
                  Share Again
                </Button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain ${
              status !== 'connected' ? 'hidden' : ''
            }`}
          />
        </div>

        {status === 'connected' && !isAgent && (
          <div className="mt-4 flex justify-center">
            <Button onClick={stopMedia} variant="destructive">
              Stop Sharing
            </Button>
          </div>
        )}

        {isAgent && status === 'connected' && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Viewing customer&apos;s {mode === 'screen_share' ? 'screen' : 'camera'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
