import { z } from "zod";

// Schemas básicos
export const idSchema = z.object({
  id: z.number().int().positive("ID é obrigatório"),
});

// Schemas de Produtos
export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  categoryId: z.number().int().positive("Categoria é obrigatória"),
  description: z.string().optional(),
  quantity: z.number().int().nonnegative("Quantidade não pode ser negativa").default(0),
  minStock: z.number().int().nonnegative("Estoque mínimo não pode ser negativo").default(10),
  price: z.string().or(z.number()).refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num >= 0;
  }, "Preço inválido"),
});

export const updateProductSchema = createProductSchema.partial();

// Schemas de Categorias
export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Schemas de Clientes
export const createCustomerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  creditLimit: z.string().or(z.number()).refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num >= 0;
  }, "Limite de crédito inválido").default(0),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Schemas de Movimentações de Estoque
export const createStockMovementSchema = z.object({
  productId: z.number().int().positive("Produto é obrigatório"),
  type: z.enum(["entrada", "saida"]),
  quantity: z.number().int().positive("Quantidade deve ser maior que zero"),
  reason: z.string().min(1, "Motivo é obrigatório").max(255),
  notes: z.string().optional(),
});

// Schemas de Caixa Financeiro
export const createCashBoxEntrySchema = z.object({
  type: z.enum(["entrada", "saida"]),
  amount: z.string().or(z.number()).refine((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return !isNaN(num) && num > 0;
  }, "Valor deve ser maior que zero"),
  reason: z.string().min(1, "Motivo é obrigatório").max(255),
  notes: z.string().optional(),
});

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateStockMovementInput = z.infer<typeof createStockMovementSchema>;
export type CreateCashBoxEntryInput = z.infer<typeof createCashBoxEntrySchema>;
export type IdInput = z.infer<typeof idSchema>;
