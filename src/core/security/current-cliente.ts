import { FastifyRequest } from "fastify";
import { prisma } from "../../infra/prisma/client";

export async function getCurrentCliente(request: FastifyRequest) {
  if (!request.user?.sub) {
    throw new Error("Usuário não autenticado");
  }

  const sub = request.user.sub;

  const cliente = await prisma.cliente.findUnique({
    where: { cognitoSub: sub },
  });

  if (!cliente) {
    throw new Error("Cliente não encontrado para este usuário Cognito");
  }

  return cliente;
}
