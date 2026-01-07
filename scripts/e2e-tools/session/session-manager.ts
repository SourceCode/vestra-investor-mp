/**
 * Session Memory Manager for E2E Tools
 *
 * Tracks what information has been communicated to the AI agent
 * within a session to avoid redundant output.
 *
 * Part of Phase 7: Token Optimization
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const CACHE_DIR = process.env.E2E_CACHE_DIR || '.e2e-cache';

/**
 * Session context structure
 */
export interface SessionContext {
  sessionId: string;
  created: string;
  lastUpdated: string;

  communicated: {
    patterns: string[];        // Pattern IDs already explained
    files: string[];           // Files already mentioned
    rootCauses: string[];      // Root causes already detailed
    fixes: string[];           // Fixes already suggested
    errors: string[];          // Error fingerprints already shown
  };

  reportHashes: string[];      // Hashes of reports already sent
  lastReportHash: string | null;

  metadata: {
    totalReports: number;
    tokensEstimated: number;
  };
}

/**
 * Session-aware report
 */
export interface SessionAwareReport {
  isNew: boolean;
  newOnly: boolean;

  // New information (not previously communicated)
  newPatterns: string[];
  newFiles: string[];
  newRootCauses: string[];
  newFixes: string[];
  newErrors: string[];

  // Already known (for reference)
  alreadyKnown: {
    patterns: string[];
    rootCauses: string[];
    fixes: string[];
  };

  // Skip flags
  skipPatterns: boolean;
  skipRootCauses: boolean;
  skipFixes: boolean;
}

/**
 * Session Manager class
 */
export class SessionManager {
  private sessionDir: string;

  constructor() {
    this.sessionDir = path.join(process.cwd(), CACHE_DIR, 'sessions');
  }

  /**
   * Create a new session
   */
  createSession(): string {
    const sessionId = this.generateSessionId();
    const session = this.initSession(sessionId);
    this.saveSession(session);
    return sessionId;
  }

  /**
   * Get or create session
   */
  getOrCreateSession(sessionId?: string): SessionContext {
    if (sessionId) {
      const existing = this.loadSession(sessionId);
      if (existing) {
        return existing;
      }
    }

    // Create new session
    const newId = sessionId || this.generateSessionId();
    const session = this.initSession(newId);
    this.saveSession(session);
    return session;
  }

  /**
   * Record that information was communicated
   */
  recordCommunicated(
    sessionId: string,
    data: {
      patterns?: string[];
      files?: string[];
      rootCauses?: string[];
      fixes?: string[];
      errors?: string[];
      reportHash?: string;
    }
  ): void {
    const session = this.loadSession(sessionId);
    if (!session) return;

    if (data.patterns) {
      session.communicated.patterns = [
        ...new Set([...session.communicated.patterns, ...data.patterns]),
      ];
    }

    if (data.files) {
      session.communicated.files = [
        ...new Set([...session.communicated.files, ...data.files]),
      ];
    }

    if (data.rootCauses) {
      session.communicated.rootCauses = [
        ...new Set([...session.communicated.rootCauses, ...data.rootCauses]),
      ];
    }

    if (data.fixes) {
      session.communicated.fixes = [
        ...new Set([...session.communicated.fixes, ...data.fixes]),
      ];
    }

    if (data.errors) {
      session.communicated.errors = [
        ...new Set([...session.communicated.errors, ...data.errors]),
      ];
    }

    if (data.reportHash) {
      session.reportHashes.push(data.reportHash);
      session.lastReportHash = data.reportHash;
    }

    session.lastUpdated = new Date().toISOString();
    session.metadata.totalReports++;

    this.saveSession(session);
  }

  /**
   * Filter report to only include new information
   */
  filterForSession(
    sessionId: string,
    data: {
      patterns: string[];
      files: string[];
      rootCauses: string[];
      fixes: string[];
      errors: string[];
      reportHash: string;
    }
  ): SessionAwareReport {
    const session = this.loadSession(sessionId);

    // If no session, everything is new
    if (!session) {
      return {
        isNew: true,
        newOnly: false,
        newPatterns: data.patterns,
        newFiles: data.files,
        newRootCauses: data.rootCauses,
        newFixes: data.fixes,
        newErrors: data.errors,
        alreadyKnown: { patterns: [], rootCauses: [], fixes: [] },
        skipPatterns: false,
        skipRootCauses: false,
        skipFixes: false,
      };
    }

    // Check if report is identical to last one
    if (session.lastReportHash === data.reportHash) {
      return {
        isNew: false,
        newOnly: true,
        newPatterns: [],
        newFiles: [],
        newRootCauses: [],
        newFixes: [],
        newErrors: [],
        alreadyKnown: {
          patterns: session.communicated.patterns,
          rootCauses: session.communicated.rootCauses,
          fixes: session.communicated.fixes,
        },
        skipPatterns: true,
        skipRootCauses: true,
        skipFixes: true,
      };
    }

    // Filter to only new items
    const knownPatterns = new Set(session.communicated.patterns);
    const knownFiles = new Set(session.communicated.files);
    const knownRootCauses = new Set(session.communicated.rootCauses);
    const knownFixes = new Set(session.communicated.fixes);
    const knownErrors = new Set(session.communicated.errors);

    const newPatterns = data.patterns.filter((p) => !knownPatterns.has(p));
    const newFiles = data.files.filter((f) => !knownFiles.has(f));
    const newRootCauses = data.rootCauses.filter((r) => !knownRootCauses.has(r));
    const newFixes = data.fixes.filter((f) => !knownFixes.has(f));
    const newErrors = data.errors.filter((e) => !knownErrors.has(e));

    return {
      isNew: newPatterns.length > 0 || newRootCauses.length > 0 || newFixes.length > 0,
      newOnly: true,
      newPatterns,
      newFiles,
      newRootCauses,
      newFixes,
      newErrors,
      alreadyKnown: {
        patterns: session.communicated.patterns,
        rootCauses: session.communicated.rootCauses,
        fixes: session.communicated.fixes,
      },
      skipPatterns: newPatterns.length === 0,
      skipRootCauses: newRootCauses.length === 0,
      skipFixes: newFixes.length === 0,
    };
  }

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): string | null {
    const session = this.loadSession(sessionId);
    if (!session) return null;

    const parts: string[] = [
      `Session: ${sessionId}`,
      `Reports: ${session.metadata.totalReports}`,
      `Known patterns: ${session.communicated.patterns.length}`,
      `Known files: ${session.communicated.files.length}`,
      `Known fixes: ${session.communicated.fixes.length}`,
    ];

    return parts.join(' | ');
  }

  /**
   * Clear session
   */
  clearSession(sessionId: string): void {
    const sessionPath = this.getSessionPath(sessionId);
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
  }

  /**
   * List all sessions
   */
  listSessions(): string[] {
    if (!fs.existsSync(this.sessionDir)) {
      return [];
    }

    return fs
      .readdirSync(this.sessionDir)
      .filter((f: string) => f.endsWith('.json'))
      .map((f: string) => f.replace('.json', ''));
  }

  /**
   * Cleanup old sessions (older than 24 hours)
   */
  cleanupOldSessions(maxAgeHours: number = 24): number {
    const sessions = this.listSessions();
    let cleaned = 0;
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;

    for (const sessionId of sessions) {
      const session = this.loadSession(sessionId);
      if (session) {
        const lastUpdated = new Date(session.lastUpdated).getTime();
        if (lastUpdated < cutoff) {
          this.clearSession(sessionId);
          cleaned++;
        }
      }
    }

    return cleaned;
  }

  // Private methods

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
  }

  private initSession(sessionId: string): SessionContext {
    return {
      sessionId,
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      communicated: {
        patterns: [],
        files: [],
        rootCauses: [],
        fixes: [],
        errors: [],
      },
      reportHashes: [],
      lastReportHash: null,
      metadata: {
        totalReports: 0,
        tokensEstimated: 0,
      },
    };
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.sessionDir, `${sessionId}.json`);
  }

  private loadSession(sessionId: string): SessionContext | null {
    const sessionPath = this.getSessionPath(sessionId);
    if (!fs.existsSync(sessionPath)) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  private saveSession(session: SessionContext): void {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    const sessionPath = this.getSessionPath(session.sessionId);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
  }
}

/**
 * Singleton instance
 */
let sessionManagerInstance: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

export const sessionManager = new SessionManager();

/**
 * Get current session ID from environment or create new
 */
export function getCurrentSessionId(): string {
  const envSession = process.env.E2E_SESSION;
  if (envSession) {
    return envSession;
  }

  // Check for session file
  const sessionFile = path.join(process.cwd(), CACHE_DIR, 'current-session');
  if (fs.existsSync(sessionFile)) {
    return fs.readFileSync(sessionFile, 'utf-8').trim();
  }

  // Create new session
  const newSession = sessionManager.createSession();

  // Save as current
  const dir = path.dirname(sessionFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(sessionFile, newSession);

  return newSession;
}

/**
 * Format session-aware output
 */
export function formatSessionAwareOutput(
  sessionId: string,
  report: SessionAwareReport
): string {
  if (!report.isNew) {
    return '{"unchanged":true,"session":"' + sessionId + '"}';
  }

  const output: Record<string, unknown> = {
    session: sessionId,
    new_only: report.newOnly,
  };

  if (report.newPatterns.length > 0) {
    output.new_patterns = report.newPatterns;
  }

  if (report.newRootCauses.length > 0) {
    output.new_causes = report.newRootCauses;
  }

  if (report.newFixes.length > 0) {
    output.new_fixes = report.newFixes;
  }

  if (report.alreadyKnown.patterns.length > 0) {
    output.known = {
      patterns: report.alreadyKnown.patterns.length,
      causes: report.alreadyKnown.rootCauses.length,
      fixes: report.alreadyKnown.fixes.length,
    };
  }

  return JSON.stringify(output);
}
