import { Cliente } from "@prisma/client";
import { prisma } from "../../infra/prisma/client";
import { CreateClienteBody } from "./clientes.schemas";

export class ClientesRepository {
  create(data: CreateClienteBody): Promise<Cliente> {
    return prisma.cliente.create({ data });
  }

  listAll(): Promise<Cliente[]> {
    return prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  }
}
