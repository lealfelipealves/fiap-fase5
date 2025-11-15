import { z } from "zod";

export const createClienteBodySchema = z.object({
  nome: z.string().min(1),
  cognitoSub: z.string().min(1),
  email: z.email(),
  documento: z.string().min(11).max(14), // cpf/cnpj
  telefone: z.string().min(8),
});

export type CreateClienteBody = z.infer<typeof createClienteBodySchema>;
