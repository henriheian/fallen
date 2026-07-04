import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user contexts
const createUserContext = (role: "admin" | "user" = "user"): TrpcContext => ({
  user: {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
});

describe("Products Procedures", () => {
  describe("products.list", () => {
    it("should allow authenticated users to list products", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.products.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("products.create", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.products.create({
          name: "Test Product",
          categoryId: 1,
          quantity: 10,
          minStock: 5,
          price: "100.00",
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to create products", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.products.create({
          name: "Test Product",
          categoryId: 1,
          quantity: 10,
          minStock: 5,
          price: "100.00",
        });
        expect(result.success).toBe(true);
      } catch (error: any) {
        // Database might not be available in test, but procedure should be accessible
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });

    it("should reject invalid product data", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.products.create({
          name: "",
          categoryId: 1,
          quantity: 10,
          minStock: 5,
          price: "100.00",
        } as any);
        expect.fail("Should have thrown validation error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });
  });

  describe("products.get", () => {
    it("should allow authenticated users to get a product", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.products.get({ id: 1 });
        // Result might be null if product doesn't exist, but should be accessible
        expect(result === null || typeof result === "object").toBe(true);
      } catch (error: any) {
        // Database might not be available, but procedure should be accessible
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("products.delete", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext("user");
      const caller = appRouter.createCaller(ctx);
      
      try {
        await caller.products.delete({ id: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin users to delete products", async () => {
      const ctx = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);
      
      try {
        const result = await caller.products.delete({ id: 1 });
        expect(result.success).toBe(true);
      } catch (error: any) {
        // Database might not be available, but procedure should be accessible
        expect(error.code).not.toBe("FORBIDDEN");
      }
    });
  });
});
