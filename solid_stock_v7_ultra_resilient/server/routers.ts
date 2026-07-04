import { COOKIE_NAME } from "#shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import * as schemas from "./schemas";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem acessar' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    getKPIs: protectedProcedure.query(async () => {
      const kpis = await db.getDashboardKPIs();
      return kpis || {
        totalProducts: 0,
        criticalProducts: 0,
        totalStock: 0,
        cashBalance: 0,
        totalIncome: 0,
        totalExpense: 0,
        topProducts: [],
      };
    }),
  }),

  // Produtos
  products: router({
    list: protectedProcedure.query(async () => {
      return db.getProducts();
    }),

    get: protectedProcedure
      .input(schemas.idSchema)
      .query(async ({ input }) => {
        return db.getProductById(input.id);
      }),

    create: adminProcedure
      .input(schemas.createProductSchema)
      .mutation(async ({ input, ctx }) => {
        const parsed = schemas.createProductSchema.parse(input);
        const price = typeof parsed.price === 'string' ? parseFloat(parsed.price) : parsed.price;
        
        await db.createProduct({
          name: parsed.name,
          categoryId: parsed.categoryId,
          description: parsed.description,
          quantity: parsed.quantity,
          minStock: parsed.minStock,
          price: price.toFixed(2),
        });
        
        return { success: true, message: 'Produto criado com sucesso' };
      }),

    update: adminProcedure
      .input(schemas.idSchema.merge(schemas.updateProductSchema))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const parsed = schemas.updateProductSchema.parse(data);
        
        const price = parsed.price ? (typeof parsed.price === 'string' ? parseFloat(parsed.price) : parsed.price) : undefined;
        const updateData: any = { ...parsed };
        if (price !== undefined) {
          updateData.price = price.toFixed(2);
        }
        
        await db.updateProduct(id, updateData);
        return { success: true, message: 'Produto atualizado com sucesso' };
      }),

    delete: adminProcedure
      .input(schemas.idSchema)
      .mutation(async ({ input, ctx }) => {
        await db.deleteProduct(input.id);
        return { success: true, message: 'Produto deletado com sucesso' };
      }),
  }),

  // Categorias
  categories: router({
    list: protectedProcedure.query(async () => {
      return db.getCategories();
    }),

    create: adminProcedure
      .input(schemas.createCategorySchema)
      .mutation(async ({ input }) => {
        const parsed = schemas.createCategorySchema.parse(input);
        await db.createCategory(parsed);
        return { success: true, message: 'Categoria criada com sucesso' };
      }),
  }),

  // Clientes
  customers: router({
    list: protectedProcedure.query(async () => {
      return db.getCustomers();
    }),

    get: protectedProcedure
      .input(schemas.idSchema)
      .query(async ({ input }) => {
        return db.getCustomerById(input.id);
      }),

    create: protectedProcedure
      .input(schemas.createCustomerSchema)
      .mutation(async ({ input }) => {
        const parsed = schemas.createCustomerSchema.parse(input);
        const creditLimit = typeof parsed.creditLimit === 'string' ? parseFloat(parsed.creditLimit) : parsed.creditLimit;
        
        await db.createCustomer({
          ...parsed,
          creditLimit: creditLimit.toFixed(2),
        });
        return { success: true, message: 'Cliente criado com sucesso' };
      }),

    update: protectedProcedure
      .input(schemas.idSchema.merge(schemas.updateCustomerSchema))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const parsed = schemas.updateCustomerSchema.parse(data);
        
        const creditLimit = parsed.creditLimit ? (typeof parsed.creditLimit === 'string' ? parseFloat(parsed.creditLimit) : parsed.creditLimit) : undefined;
        const updateData: any = { ...parsed };
        if (creditLimit !== undefined) {
          updateData.creditLimit = creditLimit.toFixed(2);
        }
        
        await db.updateCustomer(id, updateData);
        return { success: true, message: 'Cliente atualizado com sucesso' };
      }),
  }),

  // Movimentações de Estoque
  stockMovements: router({
    list: protectedProcedure.query(async () => {
      return db.getStockMovements();
    }),

    create: protectedProcedure
      .input(schemas.createStockMovementSchema)
      .mutation(async ({ input, ctx }) => {
        const parsed = schemas.createStockMovementSchema.parse(input);
        
        // Validar se produto existe
        const product = await db.getProductById(parsed.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
        }
        
        // Validar se há estoque suficiente para saída
        if (parsed.type === 'saida' && product.quantity < parsed.quantity) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Estoque insuficiente' });
        }
        
        // Atualizar quantidade do produto
        const newQuantity = parsed.type === 'entrada' 
          ? product.quantity + parsed.quantity 
          : product.quantity - parsed.quantity;
        
        await db.updateProduct(parsed.productId, { quantity: newQuantity });
        
        // Registrar movimentação
        await db.createStockMovement({
          ...parsed,
          createdBy: ctx.user.id,
        });
        
        return { success: true, message: 'Movimentação registrada com sucesso' };
      }),
  }),

  // Caixa Financeiro
  cashBox: router({
    list: protectedProcedure.query(async () => {
      return db.getCashBoxEntries();
    }),

    create: protectedProcedure
      .input(schemas.createCashBoxEntrySchema)
      .mutation(async ({ input, ctx }) => {
        const parsed = schemas.createCashBoxEntrySchema.parse(input);
        const amount = typeof parsed.amount === 'string' ? parseFloat(parsed.amount) : parsed.amount;
        
        await db.createCashBoxEntry({
          ...parsed,
          amount: amount.toFixed(2),
          createdBy: ctx.user.id,
        });
        
        return { success: true, message: 'Registro de caixa criado com sucesso' };
      }),
  }),
});

export type AppRouter = typeof appRouter;
