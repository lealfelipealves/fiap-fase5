import { StatusEstoque } from "@prisma/client";
import { z } from "zod";

export const createVeiculoBodySchema = z.object({
  marca: z.string().min(1),
  modelo: z.string().min(1),
  ano: z.number().int().min(1900),
  cor: z.string().min(1),
  preco: z.number().positive(),
});

export const updateVeiculoBodySchema = createVeiculoBodySchema.partial();

export const listVeiculosQuerySchema = z.object({
  status: z.nativeEnum(StatusEstoque).optional(),
  orderBy: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateVeiculoBody = z.infer<typeof createVeiculoBodySchema>;
export type UpdateVeiculoBody = z.infer<typeof updateVeiculoBodySchema>;
export type ListVeiculosQuery = z.infer<typeof listVeiculosQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;
