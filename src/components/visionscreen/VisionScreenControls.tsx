'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export interface Annotation {
  id: string;
  type: 'pointer' | 'highlight' | 'text';
  x: number;
  y: number;
  content?: string;
  timestamp: Date;
}

export interface VisionScreenControlsProps {
  sessionId: string;
  isAgent: boolean;
  onAddAnnotation?: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  onEndSession?: () => void;
  disabled?: boolean;
}

export function VisionScreenControls({
  sessionId,
  isAgent,
  onAddAnnotation,
  onEndSession,
  disabled = false,
}: VisionScreenControlsProps) {
  const [activeTool, setActiveTool] = useState<'pointer' | 'highlight' | 'text' | null>(null);
  const [textInput, setTextInput] = useState('');

  const tools = [
    { id: 'pointer' as const, label: '👆 Point', description: 'Click to highlight area' },
    { id: 'highlight' as const, label: '🔍 Highlight', description: 'Draw attention to area' },
    { id: 'text' as const, label: '💬 Text', description: 'Add text annotation' },
  ];

  const handleToolClick = (toolId: 'pointer' | 'highlight' | 'text') => {
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  const handleAddTextAnnotation = () => {
    if (textInput.trim() && onAddAnnotation) {
      onAddAnnotation({
        type: 'text',
        x: 50, // Center by default
        y: 50,
        content: textInput.trim(),
      });
      setTextInput('');
      setActiveTool(null);
    }
  };

  if (!isAgent) {
    // Customer view - minimal controls
    return (
      <Card className="mt-4">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Your screen is being shared with the support agent
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndSession}
              disabled={disabled}
            >
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agent view - full controls
  return (
    <Card className="mt-4">
      <CardContent className="py-4">
        <div className="space-y-4">
          {/* Annotation tools */}
          <div>
            <p className="text-sm font-medium mb-2">Annotation Tools</p>
            <div className="flex gap-2 flex-wrap">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleToolClick(tool.id)}
                  disabled={disabled}
                  title={tool.description}
                >
                  {tool.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Text annotation input */}
          {activeTool === 'text' && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter annotation text..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTextAnnotation()}
                disabled={disabled}
              />
              <Button onClick={handleAddTextAnnotation} disabled={disabled || !textInput.trim()}>
                Add
              </Button>
            </div>
          )}

          {/* Session controls */}
          <div className="flex justify-between items-center pt-2 border-t">
            <p className="text-xs text-gray-500">Session: {sessionId.slice(0, 8)}...</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndSession}
              disabled={disabled}
            >
              End VisionScreen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
