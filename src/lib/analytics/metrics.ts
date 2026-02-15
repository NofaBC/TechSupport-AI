import { adminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Internal type for case data from Firestore
interface CaseData {
  id: string;
  status?: string;
  severity?: string;
  currentLevel?: string;
  createdAt?: Timestamp;
  resolvedAt?: Timestamp;
  firstResponseAt?: Timestamp;
  ticketNumber?: string;
  assignedAgent?: string;
  [key: string]: unknown;
}

export interface DashboardMetrics {
  totalCases: number;
  openCases: number;
  resolvedToday: number;
  avgResolutionTime: number; // in minutes
  firstContactResolutionRate: number; // percentage
  escalationRate: number; // percentage
  casesByLevel: {
    L1: number;
    L2: number;
    L3: number;
  };
  casesBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface CaseTrend {
  date: string;
  created: number;
  resolved: number;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  casesHandled: number;
  avgResolutionTime: number;
  firstContactResolutions: number;
  escalations: number;
  satisfaction?: number;
}

export interface SLAMetrics {
  responseTimeSLA: {
    target: number; // minutes
    met: number;
    breached: number;
    percentage: number;
  };
  resolutionTimeSLA: {
    target: number; // hours
    met: number;
    breached: number;
    percentage: number;
  };
  currentBreaches: Array<{
    caseId: string;
    ticketNumber: string;
    type: 'response' | 'resolution';
    breachedAt: Date;
    severity: string;
  }>;
}

/**
 * Get dashboard overview metrics
 */
export async function getDashboardMetrics(
  tenantId: string,
  dateRange?: { start: Date; end: Date }
): Promise<DashboardMetrics> {
  const db = adminDb();
  const casesRef = db.collection('tenants').doc(tenantId).collection('cases');

  // Default to last 30 days if no range specified
  const endDate = dateRange?.end || new Date();
  const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  const startTimestamp = Timestamp.fromDate(startDate);
  const endTimestamp = Timestamp.fromDate(endDate);

  // Get all cases in date range
  const snapshot = await casesRef
    .where('createdAt', '>=', startTimestamp)
    .where('createdAt', '<=', endTimestamp)
    .get();

  const cases: CaseData[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Calculate metrics
  const totalCases = cases.length;
  const openCases = cases.filter((c) => 
    ['open', 'pending', 'escalated_L2', 'escalated_human'].includes(c.status as string)
  ).length;

  // Resolved today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const resolvedToday = cases.filter((c) => {
    const resolvedAt = (c.resolvedAt as Timestamp)?.toDate();
    return c.status === 'resolved' && resolvedAt && resolvedAt >= todayStart;
  }).length;

  // Resolution time calculation
  const resolvedCases = cases.filter((c) => c.status === 'resolved' && c.resolvedAt);
  let totalResolutionTime = 0;
  resolvedCases.forEach((c) => {
    const created = (c.createdAt as Timestamp)?.toDate();
    const resolved = (c.resolvedAt as Timestamp)?.toDate();
    if (created && resolved) {
      totalResolutionTime += (resolved.getTime() - created.getTime()) / 60000;
    }
  });
  const avgResolutionTime = resolvedCases.length > 0 
    ? Math.round(totalResolutionTime / resolvedCases.length) 
    : 0;

  // First contact resolution (resolved at L1 without escalation)
  const l1Resolved = cases.filter((c) => 
    c.status === 'resolved' && c.currentLevel === 'L1'
  ).length;
  const firstContactResolutionRate = totalCases > 0 
    ? Math.round((l1Resolved / totalCases) * 100) 
    : 0;

  // Escalation rate
  const escalatedCases = cases.filter((c) => 
    ['L2', 'L3'].includes(c.currentLevel as string)
  ).length;
  const escalationRate = totalCases > 0 
    ? Math.round((escalatedCases / totalCases) * 100) 
    : 0;

  // Cases by level
  const casesByLevel = {
    L1: cases.filter((c) => c.currentLevel === 'L1').length,
    L2: cases.filter((c) => c.currentLevel === 'L2').length,
    L3: cases.filter((c) => c.currentLevel === 'L3').length,
  };

  // Cases by severity
  const casesBySeverity = {
    low: cases.filter((c) => c.severity === 'low').length,
    medium: cases.filter((c) => c.severity === 'medium').length,
    high: cases.filter((c) => c.severity === 'high').length,
    critical: cases.filter((c) => c.severity === 'critical').length,
  };

  return {
    totalCases,
    openCases,
    resolvedToday,
    avgResolutionTime,
    firstContactResolutionRate,
    escalationRate,
    casesByLevel,
    casesBySeverity,
  };
}

/**
 * Get case trends over time
 */
export async function getCaseTrends(
  tenantId: string,
  days: number = 14
): Promise<CaseTrend[]> {
  const db = adminDb();
  const casesRef = db.collection('tenants').doc(tenantId).collection('cases');

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const snapshot = await casesRef
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();

  const cases: CaseData[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Group by date
  const trends: Map<string, { created: number; resolved: number }> = new Map();

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    trends.set(dateStr, { created: 0, resolved: 0 });
  }

  cases.forEach((c) => {
    const createdAt = (c.createdAt as Timestamp)?.toDate();
    if (createdAt) {
      const dateStr = createdAt.toISOString().slice(0, 10);
      const existing = trends.get(dateStr);
      if (existing) {
        existing.created++;
      }
    }

    if (c.status === 'resolved' && c.resolvedAt) {
      const resolvedAt = (c.resolvedAt as Timestamp)?.toDate();
      if (resolvedAt) {
        const dateStr = resolvedAt.toISOString().slice(0, 10);
        const existing = trends.get(dateStr);
        if (existing) {
          existing.resolved++;
        }
      }
    }
  });

  return Array.from(trends.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}

/**
 * Get SLA metrics
 */
export async function getSLAMetrics(
  tenantId: string,
  config: { responseTimeTarget: number; resolutionTimeTarget: number } = {
    responseTimeTarget: 15, // 15 minutes
    resolutionTimeTarget: 24, // 24 hours
  }
): Promise<SLAMetrics> {
  const db = adminDb();
  const casesRef = db.collection('tenants').doc(tenantId).collection('cases');

  // Get cases from last 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const snapshot = await casesRef
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();

  const cases: CaseData[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  let responseMet = 0;
  let responseBreached = 0;
  let resolutionMet = 0;
  let resolutionBreached = 0;
  const currentBreaches: SLAMetrics['currentBreaches'] = [];

  const now = new Date();

  cases.forEach((c) => {
    const createdAt = (c.createdAt as Timestamp)?.toDate();
    if (!createdAt) return;

    // For open cases, check if SLA is being breached
    if (c.status !== 'resolved') {
      const minutesOpen = (now.getTime() - createdAt.getTime()) / 60000;
      const hoursOpen = minutesOpen / 60;

      // Response SLA breach (assuming first response should happen within target)
      if (minutesOpen > config.responseTimeTarget && !c.firstResponseAt) {
        currentBreaches.push({
          caseId: c.id,
          ticketNumber: c.ticketNumber as string,
          type: 'response',
          breachedAt: new Date(createdAt.getTime() + config.responseTimeTarget * 60000),
          severity: c.severity as string,
        });
        responseBreached++;
      } else {
        responseMet++;
      }

      // Resolution SLA breach
      if (hoursOpen > config.resolutionTimeTarget) {
        currentBreaches.push({
          caseId: c.id,
          ticketNumber: c.ticketNumber as string,
          type: 'resolution',
          breachedAt: new Date(createdAt.getTime() + config.resolutionTimeTarget * 3600000),
          severity: c.severity as string,
        });
        resolutionBreached++;
      }
    } else {
      // For resolved cases, check if SLA was met
      const resolvedAt = (c.resolvedAt as Timestamp)?.toDate();
      if (resolvedAt) {
        const resolutionHours = (resolvedAt.getTime() - createdAt.getTime()) / 3600000;
        if (resolutionHours <= config.resolutionTimeTarget) {
          resolutionMet++;
        } else {
          resolutionBreached++;
        }
      }
      responseMet++; // Assume response SLA was met for resolved cases
    }
  });

  const totalResponse = responseMet + responseBreached;
  const totalResolution = resolutionMet + resolutionBreached;

  return {
    responseTimeSLA: {
      target: config.responseTimeTarget,
      met: responseMet,
      breached: responseBreached,
      percentage: totalResponse > 0 ? Math.round((responseMet / totalResponse) * 100) : 100,
    },
    resolutionTimeSLA: {
      target: config.resolutionTimeTarget,
      met: resolutionMet,
      breached: resolutionBreached,
      percentage: totalResolution > 0 ? Math.round((resolutionMet / totalResolution) * 100) : 100,
    },
    currentBreaches: currentBreaches.slice(0, 10), // Return top 10 breaches
  };
}

/**
 * Get performance metrics by support level
 */
export async function getLevelPerformance(
  tenantId: string
): Promise<{
  L1: { resolved: number; avgTime: number; automationRate: number };
  L2: { resolved: number; avgTime: number };
  L3: { resolved: number; avgTime: number };
}> {
  const db = adminDb();
  const casesRef = db.collection('tenants').doc(tenantId).collection('cases');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const snapshot = await casesRef
    .where('createdAt', '>=', Timestamp.fromDate(startDate))
    .get();

  const cases: CaseData[] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const levels = {
    L1: { resolved: 0, totalTime: 0, count: 0, automated: 0 },
    L2: { resolved: 0, totalTime: 0, count: 0 },
    L3: { resolved: 0, totalTime: 0, count: 0 },
  };

  cases.forEach((c) => {
    const level = c.currentLevel as 'L1' | 'L2' | 'L3';
    if (!levels[level]) return;

    if (c.status === 'resolved') {
      levels[level].resolved++;
      const createdAt = (c.createdAt as Timestamp)?.toDate();
      const resolvedAt = (c.resolvedAt as Timestamp)?.toDate();
      if (createdAt && resolvedAt) {
        levels[level].totalTime += (resolvedAt.getTime() - createdAt.getTime()) / 60000;
        levels[level].count++;
      }

      // Track automation (L1 cases resolved without human intervention)
      if (level === 'L1' && !c.assignedAgent) {
        levels.L1.automated++;
      }
    }
  });

  return {
    L1: {
      resolved: levels.L1.resolved,
      avgTime: levels.L1.count > 0 ? Math.round(levels.L1.totalTime / levels.L1.count) : 0,
      automationRate: levels.L1.resolved > 0 
        ? Math.round((levels.L1.automated / levels.L1.resolved) * 100) 
        : 0,
    },
    L2: {
      resolved: levels.L2.resolved,
      avgTime: levels.L2.count > 0 ? Math.round(levels.L2.totalTime / levels.L2.count) : 0,
    },
    L3: {
      resolved: levels.L3.resolved,
      avgTime: levels.L3.count > 0 ? Math.round(levels.L3.totalTime / levels.L3.count) : 0,
    },
  };
}
