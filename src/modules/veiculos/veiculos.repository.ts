import { prisma } from "@/infra/prisma/client";
import { StatusEstoque, Veiculo } from "@prisma/client";
import { CreateVeiculoBody, UpdateVeiculoBody } from "./veiculos.schemas";

export class VeiculosRepository {
  async create(data: CreateVeiculoBody): Promise<Veiculo> {
    return prisma.veiculo.create({
      data: {
        ...data,
        statusEstoque: StatusEstoque.DISPONIVEL,
      },
    });
  }

  async findById(id: Veiculo["id"]): Promise<Veiculo | null> {
    return prisma.veiculo.findUnique({ where: { id } });
  }

  async update(id: Veiculo["id"], data: UpdateVeiculoBody): Promise<Veiculo> {
    return prisma.veiculo.update({
      where: { id },
      data,
    });
  }

  async listByStatusOrdered(
    status: "DISPONIVEL" | "VENDIDO",
    orderBy: "asc" | "desc" = "asc"
  ): Promise<Veiculo[]> {
    return prisma.veiculo.findMany({
      where: { statusEstoque: status },
      orderBy: { preco: orderBy },
    });
  }

  async setStatus(id: Veiculo["id"], status: Veiculo["statusEstoque"]) {
    return prisma.veiculo.update({
      where: { id },
      data: { statusEstoque: status },
    });
  }
}
