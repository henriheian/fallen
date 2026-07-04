import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  createCustomerSchema,
  createStockMovementSchema,
  createCashBoxEntrySchema,
} from "./schemas";

describe("Zod Schemas", () => {
  describe("createProductSchema", () => {
    it("should validate a valid product", () => {
      const validProduct = {
        name: "Arroz 5kg",
        categoryId: 1,
        quantity: 50,
        minStock: 10,
        price: "25.50",
        description: "Arroz integral",
      };
      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject product without name", () => {
      const invalidProduct = {
        categoryId: 1,
        quantity: 50,
        minStock: 10,
        price: "25.50",
      };
      const result = createProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should reject negative quantity", () => {
      const invalidProduct = {
        name: "Arroz 5kg",
        categoryId: 1,
        quantity: -10,
        minStock: 10,
        price: "25.50",
      };
      const result = createProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should reject invalid price", () => {
      const invalidProduct = {
        name: "Arroz 5kg",
        categoryId: 1,
        quantity: 50,
        minStock: 10,
        price: "invalid",
      };
      const result = createProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });
  });

  describe("createCustomerSchema", () => {
    it("should validate a valid customer", () => {
      const validCustomer = {
        name: "João Silva",
        email: "joao@example.com",
        phone: "11999999999",
        address: "Rua A, 123",
        creditLimit: "1000",
      };
      const result = createCustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it("should reject customer without name", () => {
      const invalidCustomer = {
        email: "joao@example.com",
        creditLimit: "1000",
      };
      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const invalidCustomer = {
        name: "João Silva",
        email: "invalid-email",
        creditLimit: "1000",
      };
      const result = createCustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
    });
  });

  describe("createStockMovementSchema", () => {
    it("should validate a valid stock movement", () => {
      const validMovement = {
        productId: 1,
        type: "entrada" as const,
        quantity: 50,
        reason: "Compra",
        notes: "Fornecedor A",
      };
      const result = createStockMovementSchema.safeParse(validMovement);
      expect(result.success).toBe(true);
    });

    it("should reject invalid type", () => {
      const invalidMovement = {
        productId: 1,
        type: "invalid",
        quantity: 50,
        reason: "Compra",
      };
      const result = createStockMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });

    it("should reject zero quantity", () => {
      const invalidMovement = {
        productId: 1,
        type: "entrada" as const,
        quantity: 0,
        reason: "Compra",
      };
      const result = createStockMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });
  });

  describe("createCashBoxEntrySchema", () => {
    it("should validate a valid cash box entry", () => {
      const validEntry = {
        type: "entrada" as const,
        amount: "1500.50",
        reason: "Venda",
        notes: "Venda do dia",
      };
      const result = createCashBoxEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it("should reject negative amount", () => {
      const invalidEntry = {
        type: "entrada" as const,
        amount: "-100",
        reason: "Venda",
      };
      const result = createCashBoxEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const invalidEntry = {
        type: "saida" as const,
        amount: 0,
        reason: "Despesa",
      };
      const result = createCashBoxEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it("should accept numeric amount", () => {
      const validEntry = {
        type: "entrada" as const,
        amount: 1500.50,
        reason: "Venda",
      };
      const result = createCashBoxEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });
});
