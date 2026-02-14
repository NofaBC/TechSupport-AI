import { Timestamp } from 'firebase/firestore';

// ============================================
// Enums
// ============================================

export type CaseStatus = 'open' | 'pending' | 'resolved' | 'escalated_L2' | 'escalated_human';
export type CaseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SupportLevel = 'L1' | 'L2' | 'L3';
export type UserRole = 'owner' | 'agent' | 'viewer' | 'human_support';
export type PlanType = 'starter' | 'pro' | 'enterprise';
export type KBStatus = 'processing' | 'ready' | 'error';
export type KBDocStatus = 'uploading' | 'processing' | 'embedded' | 'error';
export type KBFileType = 'pdf' | 'md' | 'txt' | 'html' | 'docx' | 'csv';

export type TimelineEventType =
  | 'call_started'
  | 'sms_sent'
  | 'email_sent'
  | 'ai_response'
  | 'step_attempted'
  | 'escalation'
  | 'visionscreen_started'
  | 'visionscreen_ended'
  | 'human_joined'
  | 'note_added'
  | 'resolved';

export type ArtifactType = 'transcript' | 'summary' | 'visionscreen_session' | 'escalation_packet';
export type UsageEventType = 'resolution' | 'l2_minute' | 'sms' | 'voice_minute';

// ============================================
// Core Models
// ============================================

export interface Tenant {
  id: string;
  name: string;
  plan: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  settings: TenantSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TenantSettings {
  languages: string[];
  escalationEmail: string;
  defaultProduct?: string;
  twilioPhoneNumber?: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Timestamp;
}

export interface CustomerContact {
  phone: string;
  email?: string;
  name?: string;
}

export interface Case {
  id: string;
  tenantId: string;
  ticketNumber: string;
  product: string;
  category: string;
  severity: CaseSeverity;
  language: string;
  status: CaseStatus;
  currentLevel: SupportLevel;
  customerContact: CustomerContact;
  assignedAgent?: string;
  summary?: string;
  problem?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  type: TimelineEventType;
  level: SupportLevel;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  createdBy: 'ai' | 'system' | string; // userId if human
}

export interface Artifact {
  id: string;
  caseId: string;
  type: ArtifactType;
  content: string | Record<string, unknown>;
  createdAt: Timestamp;
}

export interface UsageEvent {
  id: string;
  tenantId: string;
  type: UsageEventType;
  caseId: string;
  quantity: number;
  timestamp: Timestamp;
  billed: boolean;
}

// ============================================
// Knowledge Base
// ============================================

export interface KnowledgeBase {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  product: string;
  status: KBStatus;
  documentCount: number;
  chunkCount: number;
  lastTrainedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface KBDocument {
  id: string;
  knowledgeBaseId: string;
  filename: string;
  fileType: KBFileType;
  fileSize: number;
  storageUrl: string;
  status: KBDocStatus;
  chunkCount: number;
  createdAt: Timestamp;
}

// ============================================
// VisionScreen
// ============================================

export interface VisionScreenSession {
  id: string;
  caseId: string;
  tenantId: string;
  token: string;
  mode: 'screen' | 'camera';
  status: 'pending' | 'active' | 'ended';
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

// ============================================
// Escalation Packet (L3)
// ============================================

export interface EscalationPacket {
  caseId: string;
  ticketNumber: string;
  summary: string;
  timelineHighlights: TimelineHighlight[];
  stepsAttempted: StepAttempted[];
  customerContact: CustomerContact;
  severity: CaseSeverity;
  recommendedAction: string;
  artifacts: string[];
  createdAt: Timestamp;
}

export interface TimelineHighlight {
  timestamp: Timestamp;
  event: string;
  outcome?: string;
}

export interface StepAttempted {
  step: string;
  outcome: 'success' | 'failed' | 'skipped';
  notes?: string;
}

// ============================================
// Playbooks
// ============================================

export interface Playbook {
  id: string;
  name: string;
  category: string;
  product?: string;
  severity?: CaseSeverity[];
  steps: PlaybookStep[];
}

export interface PlaybookStep {
  id: string;
  title: string;
  description: string;
  action?: 'ask' | 'verify' | 'execute' | 'escalate';
  conditions?: PlaybookCondition[];
  nextStepOnSuccess?: string;
  nextStepOnFailure?: string;
}

export interface PlaybookCondition {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt';
  value: string | number;
}

// ============================================
// API Types
// ============================================

export interface CreateCaseInput {
  product: string;
  category: string;
  severity: CaseSeverity;
  language: string;
  customerContact: CustomerContact;
  problem?: string;
}

export interface UpdateCaseInput {
  status?: CaseStatus;
  currentLevel?: SupportLevel;
  assignedAgent?: string;
  summary?: string;
}

export interface EscalateCaseInput {
  targetLevel: 'L2' | 'L3';
  notes?: string;
}

export interface CreateKBInput {
  name: string;
  description: string;
  product: string;
}

// ============================================
// UI Types
// ============================================

export interface CaseFilters {
  status?: CaseStatus[];
  severity?: CaseSeverity[];
  level?: SupportLevel[];
  product?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
