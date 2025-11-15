import { z } from "zod";

export const registerBodySchema = z.object({
  nome: z.string().min(3),
  email: z.email(),
  senha: z.string().min(6),
  documento: z.string().min(3).optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

export const loginBodySchema = z.object({
  email: z.email(),
  senha: z.string().min(6),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
