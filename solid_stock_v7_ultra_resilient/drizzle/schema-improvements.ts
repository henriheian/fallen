import { int, varchar, text, timestamp, boolean, decimal, mysqlEnum, datetime } from "drizzle-orm/mysql-core";
import { mysqlTable } from "drizzle-orm/mysql-core";

// ============================================
// BILLING & SUBSCRIPTION
// ============================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).unique(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }).unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).notNull(),
  paidAt: timestamp("paidAt"),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// AUDIT LOG
// ============================================
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 50 }).notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entityType: varchar("entityType", { length: 50 }).notNull(), // PRODUCT, CUSTOMER, INVOICE, etc
  entityId: int("entityId"),
  changes: text("changes"), // JSON: { before: {}, after: {} }
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// TWO-FACTOR AUTHENTICATION
// ============================================
export const twoFactorAuth = mysqlTable("twoFactorAuth", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  secret: varchar("secret", { length: 255 }), // TOTP secret
  backupCodes: text("backupCodes"), // JSON array of backup codes
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const loginSessions = mysqlTable("loginSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).unique().notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// CACHE & PERFORMANCE
// ============================================
export const cacheKeys = mysqlTable("cacheKeys", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value"), // JSON
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// REPORTS & ANALYTICS
// ============================================
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["sales", "inventory", "customers", "financial", "custom"]).notNull(),
  query: text("query"), // SQL query or filter config
  schedule: mysqlEnum("schedule", ["once", "daily", "weekly", "monthly"]),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reportResults = mysqlTable("reportResults", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull(),
  data: text("data"), // JSON
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

// ============================================
// API KEYS & INTEGRATIONS
// ============================================
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  secret: varchar("secret", { length: 255 }).notNull(),
  scopes: text("scopes"), // JSON array: ["read:products", "write:orders", etc]
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: text("events"), // JSON array: ["product.created", "order.updated", etc]
  active: boolean("active").default(true).notNull(),
  secret: varchar("secret", { length: 255 }).notNull(), // For signing requests
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  failureCount: int("failureCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// MULTI-WAREHOUSE SUPPORT
// ============================================
export const warehouses = mysqlTable("warehouses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 20 }),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const warehouseStock = mysqlTable("warehouseStock", {
  id: int("id").autoincrement().primaryKey(),
  warehouseId: int("warehouseId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").default(0).notNull(),
  reserved: int("reserved").default(0).notNull(),
  lastCountedAt: timestamp("lastCountedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// TYPES
// ============================================
export type Subscription = typeof subscriptions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type LoginSession = typeof loginSessions.$inferSelect;
export type CacheKey = typeof cacheKeys.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ReportResult = typeof reportResults.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Webhook = typeof webhooks.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type WarehouseStock = typeof warehouseStock.$inferSelect;
