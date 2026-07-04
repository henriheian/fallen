import { getDb } from './db';

export interface AuditLogInput {
  userId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
  entityType: string;
  entityId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an action to the audit log
 */
export async function logAction(input: AuditLogInput) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[AuditLog] Database not available');
      return;
    }

    // For now, we'll just log to console
    // In production, this would write to the auditLogs table
    console.log('[AuditLog]', {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      timestamp: new Date().toISOString(),
      ipAddress: input.ipAddress,
    });

    // TODO: Implement database write when schema is migrated
    // await db.insert(auditLogs).values({
    //   userId: input.userId,
    //   action: input.action,
    //   entityType: input.entityType,
    //   entityId: input.entityId,
    //   changes: input.changes ? JSON.stringify(input.changes) : null,
    //   ipAddress: input.ipAddress,
    //   userAgent: input.userAgent,
    //   createdAt: new Date(),
    // });
  } catch (error) {
    console.error('[AuditLog] Error logging action:', error);
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: number, limit = 100) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[AuditLog] Database not available');
      return [];
    }

    // TODO: Implement database query when schema is migrated
    // const logs = await db
    //   .select()
    //   .from(auditLogs)
    //   .where(eq(auditLogs.userId, userId))
    //   .orderBy(desc(auditLogs.createdAt))
    //   .limit(limit);

    // return logs;
    return [];
  } catch (error) {
    console.error('[AuditLog] Error getting audit logs:', error);
    return [];
  }
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(entityType: string, entityId: number) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[AuditLog] Database not available');
      return [];
    }

    // TODO: Implement database query when schema is migrated
    // const logs = await db
    //   .select()
    //   .from(auditLogs)
    //   .where(
    //     and(
    //       eq(auditLogs.entityType, entityType),
    //       eq(auditLogs.entityId, entityId)
    //     )
    //   )
    //   .orderBy(desc(auditLogs.createdAt));

    // return logs;
    return [];
  } catch (error) {
    console.error('[AuditLog] Error getting entity audit logs:', error);
    return [];
  }
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(userId: number) {
  try {
    const logs = await getUserAuditLogs(userId, 10000);

    const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'User Agent'];
    const rows = logs.map((log: any) => [
      log.createdAt,
      log.action,
      log.entityType,
      log.entityId || '',
      log.ipAddress || '',
      log.userAgent || '',
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    return csv;
  } catch (error) {
    console.error('[AuditLog] Error exporting audit logs:', error);
    throw error;
  }
}
