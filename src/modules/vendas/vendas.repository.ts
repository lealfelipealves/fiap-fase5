import { Prisma, StatusVenda, Venda } from "@prisma/client";
import { prisma } from "../../infra/prisma/client";

export class VendasRepository {
  async create(data: Prisma.VendaCreateInput): Promise<Venda> {
    return prisma.venda.create({ data });
  }

  async findById(id: string): Promise<Venda | null> {
    return prisma.venda.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.VendaUpdateInput): Promise<Venda> {
    return prisma.venda.update({
      where: { id },
      data,
    });
  }

  async updateStatus(
    id: string,
    status: StatusVenda,
    codigoPagamento?: string | null
  ): Promise<Venda> {
    return prisma.venda.update({
      where: { id },
      data: {
        status,
        ...(codigoPagamento !== undefined && { codigoPagamento }),
      },
    });
  }

  async listByStatusOrdered(status?: StatusVenda): Promise<Venda[]> {
    return prisma.venda.findMany({
      where: status ? { status } : undefined,
      orderBy: { veiculo: { preco: "asc" } },
      include: {
        cliente: true,
        veiculo: true,
      },
    });
  }
}
