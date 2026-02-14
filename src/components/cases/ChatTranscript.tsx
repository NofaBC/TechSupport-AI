'use client';

import { useEffect, useRef } from 'react';
import { formatTime } from '@/lib/utils';
import type { TimelineEvent } from '@/types';

interface Message {
  id: string;
  sender: 'ai' | 'customer' | 'agent';
  content: string;
  timestamp: Date;
  level?: 'L1' | 'L2' | 'L3';
}

interface ChatTranscriptProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

// Convert timeline events to chat messages
function eventsToMessages(events: TimelineEvent[]): Message[] {
  return events
    .filter((event) => 
      event.type === 'ai_response' || 
      event.type === 'sms_sent' ||
      event.metadata?.isMessage
    )
    .map((event) => {
      // Handle both Firestore Timestamp and Date objects
      const createdAt = event.createdAt;
      const timestamp = 'toDate' in createdAt ? createdAt.toDate() : createdAt as unknown as Date;
      return {
        id: event.id,
        sender: (event.createdBy === 'ai' ? 'ai' : 
                event.createdBy === 'system' ? 'ai' : 'agent') as 'ai' | 'customer' | 'agent',
        content: event.content,
        timestamp,
        level: event.level,
      };
    });
}

export function ChatTranscript({ events, isLoading }: ChatTranscriptProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = eventsToMessages(events);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
          >
            <div className="animate-pulse">
              <div className={`h-16 ${i % 2 === 0 ? 'w-64' : 'w-48'} rounded-lg bg-gray-200`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <span className="text-4xl mb-2">💬</span>
        <p>No messages yet</p>
        <p className="text-sm mt-1">Conversation will appear here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isAI = message.sender === 'ai';
  const isAgent = message.sender === 'agent';

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] ${isAI ? 'order-2' : 'order-1'}`}>
        {/* Sender label */}
        <div className={`flex items-center gap-2 mb-1 ${isAI ? '' : 'justify-end'}`}>
          {isAI && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600">
              <span>🤖</span>
              AI Assistant
              {message.level && (
                <span className="px-1.5 py-0.5 bg-purple-100 rounded text-[10px]">
                  {message.level}
                </span>
              )}
            </span>
          )}
          {isAgent && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
              <span>👤</span>
              Agent
            </span>
          )}
          {!isAI && !isAgent && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600">
              <span>📱</span>
              Customer
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isAI
              ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
              : isAgent
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-green-500 text-white rounded-tr-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <div className={`mt-1 text-xs text-gray-400 ${isAI ? '' : 'text-right'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}

// Message input component (for later use with real-time chat)
interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder = 'Type a message...' }: MessageInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const message = input.value.trim();
    
    if (message) {
      onSend(message);
      input.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          name="message"
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
}
