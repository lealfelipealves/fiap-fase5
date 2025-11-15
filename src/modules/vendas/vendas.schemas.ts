import { StatusVenda } from "@prisma/client";
import { z } from "zod";

export const reservaVeiculoBodySchema = z.object({
  clienteId: z.uuid(),
  veiculoId: z.uuid(),
});

export type ReservaVeiculoBody = z.infer<typeof reservaVeiculoBodySchema>;

export const idParamSchema = z.object({
  id: z.uuid(),
});
export type IdParam = z.infer<typeof idParamSchema>;

export const cancelarVendaBodySchema = z.object({
  motivo: z.string().min(3).max(255).optional(),
});
export type CancelarVendaBody = z.infer<typeof cancelarVendaBodySchema>;

export const listarVendasQuerySchema = z.object({
  status: z.nativeEnum(StatusVenda).optional(),
});
export type ListarVendasQuery = z.infer<typeof listarVendasQuerySchema>;
