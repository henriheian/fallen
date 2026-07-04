import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, categories, customers, stockMovements, cashBox } from "#drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  let db;
  try {
    db = await getDb();
  } catch (e) {
    console.warn("[Database] Connection refused during upsertUser. Skipping persistence.");
    return;
  }

  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    // If it's a connection error (ECONNREFUSED), don't crash the app
    if (String(error).includes("ECONNREFUSED")) {
      console.warn("[Database] Connection refused. User data not persisted but session will continue.");
      return;
    }
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  let db;
  try {
    db = await getDb();
  } catch (e) {
    return undefined;
  }
  
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.warn("[Database] Error fetching user:", error);
    return undefined;
  }
}

// Produtos
export async function getProducts() {
  const db = await getDb().catch(() => null);
  if (!db) return [];
  try {
    return await db.select().from(products);
  } catch (e) {
    return [];
  }
}

export async function getProductById(id: number) {
  const db = await getDb().catch(() => null);
  if (!db) return undefined;
  try {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  } catch (e) {
    return undefined;
  }
}

export async function createProduct(data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.insert(products).values(data);
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.delete(products).where(eq(products.id, id));
}

// Categorias
export async function getCategories() {
  const db = await getDb().catch(() => null);
  if (!db) return [];
  try {
    return await db.select().from(categories);
  } catch (e) {
    return [];
  }
}

export async function createCategory(data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.insert(categories).values(data);
}

// Clientes
export async function getCustomers() {
  const db = await getDb().catch(() => null);
  if (!db) return [];
  try {
    return await db.select().from(customers);
  } catch (e) {
    return [];
  }
}

export async function getCustomerById(id: number) {
  const db = await getDb().catch(() => null);
  if (!db) return undefined;
  try {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return result[0];
  } catch (e) {
    return undefined;
  }
}

export async function createCustomer(data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.insert(customers).values(data);
}

export async function updateCustomer(id: number, data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.update(customers).set(data).where(eq(customers.id, id));
}

// Movimentações de Estoque
export async function getStockMovements() {
  const db = await getDb().catch(() => null);
  if (!db) return [];
  try {
    return await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt));
  } catch (e) {
    return [];
  }
}

export async function createStockMovement(data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.insert(stockMovements).values(data);
}

// Caixa Financeiro
export async function getCashBoxEntries() {
  const db = await getDb().catch(() => null);
  if (!db) return [];
  try {
    return await db.select().from(cashBox).orderBy(desc(cashBox.createdAt));
  } catch (e) {
    return [];
  }
}

export async function createCashBoxEntry(data: any) {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  return db.insert(cashBox).values(data);
}

// Dashboard - KPIs
export async function getDashboardKPIs() {
  const db = await getDb().catch(() => null);
  if (!db) return null;
  
  try {
    const totalProducts = await db.select().from(products);
    const criticalProducts = totalProducts.filter(p => p.quantity <= p.minStock);
    const totalStock = totalProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    const cashEntries = await db.select().from(cashBox);
    const totalIncome = cashEntries.filter(c => c.type === 'entrada').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const totalExpense = cashEntries.filter(c => c.type === 'saida').reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const cashBalance = totalIncome - totalExpense;
    
    const movements = await db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt)).limit(100);
    const topProducts = movements
      .filter(m => m.type === 'saida')
      .reduce((acc: any, m) => {
        const existing = acc.find((item: any) => item.productId === m.productId);
        if (existing) existing.quantity += m.quantity;
        else acc.push({ productId: m.productId, quantity: m.quantity });
        return acc;
      }, [])
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return {
      totalProducts: totalProducts.length,
      criticalProducts: criticalProducts.length,
      totalStock,
      cashBalance,
      totalIncome,
      totalExpense,
      topProducts,
    };
  } catch (e) {
    return {
      totalProducts: 0,
      criticalProducts: 0,
      totalStock: 0,
      cashBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      topProducts: [],
    };
  }
}
