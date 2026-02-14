'use client';

import { formatDateTime } from '@/lib/utils';
import type { TimelineEvent, TimelineEventType } from '@/types';

// Event type configurations
const eventConfig: Record<TimelineEventType, { icon: string; color: string; bgColor: string }> = {
  call_started: { icon: '📞', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  sms_sent: { icon: '💬', color: 'text-green-600', bgColor: 'bg-green-100' },
  email_sent: { icon: '📧', color: 'text-green-600', bgColor: 'bg-green-100' },
  ai_response: { icon: '🤖', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  step_attempted: { icon: '⚡', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  escalation: { icon: '⬆️', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  visionscreen_started: { icon: '👁️', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  visionscreen_ended: { icon: '👁️', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  human_joined: { icon: '👤', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  note_added: { icon: '📝', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  resolved: { icon: '✅', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
};

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

export function Timeline({ events, isLoading }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timeline events yet
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
      
      <div className="space-y-6">
        {events.map((event, index) => {
          const config = eventConfig[event.type] || eventConfig.step_attempted;
          
          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon bubble */}
              <div
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor} border-2 border-white shadow-sm`}
              >
                <span className="text-lg">{config.icon}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium ${config.color}`}>
                      {formatEventType(event.type)}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {event.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDateTime(event.createdAt)}
                  </div>
                </div>
                
                {/* Level badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    event.level === 'L1' ? 'bg-blue-100 text-blue-700' :
                    event.level === 'L2' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {event.level}
                  </span>
                  {event.createdBy !== 'system' && event.createdBy !== 'ai' && (
                    <span className="text-xs text-gray-400">
                      by {event.createdBy}
                    </span>
                  )}
                </div>
                
                {/* Metadata preview */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                      Show details
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatEventType(type: TimelineEventType): string {
  const labels: Record<TimelineEventType, string> = {
    call_started: 'Call Started',
    sms_sent: 'SMS Sent',
    email_sent: 'Email Sent',
    ai_response: 'AI Response',
    step_attempted: 'Step Attempted',
    escalation: 'Escalation',
    visionscreen_started: 'VisionScreen Started',
    visionscreen_ended: 'VisionScreen Ended',
    human_joined: 'Human Agent Joined',
    note_added: 'Note Added',
    resolved: 'Resolved',
  };
  return labels[type] || type;
}
