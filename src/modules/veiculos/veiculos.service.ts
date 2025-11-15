import { StatusEstoque, Veiculo } from "@prisma/client";
import { VeiculosRepository } from "./veiculos.repository";
import { CreateVeiculoBody, UpdateVeiculoBody } from "./veiculos.schemas";

export class VeiculosService {
  constructor(private readonly repo = new VeiculosRepository()) {}

  async cadastrarVeiculo(data: CreateVeiculoBody) {
    return this.repo.create(data);
  }

  async editarVeiculo(id: Veiculo["id"], data: UpdateVeiculoBody) {
    const veiculo = await this.repo.findById(id);
    if (!veiculo) {
      throw new Error("Veículo não encontrado");
    }

    // regra simples: não deixar editar depois de vendido
    if (veiculo.statusEstoque === StatusEstoque.VENDIDO) {
      throw new Error("Não é possível editar veículo já vendido");
    }

    return this.repo.update(id, data);
  }

  async listarDisponiveis(orderBy: "asc" | "desc" = "asc") {
    return this.repo.listByStatusOrdered(StatusEstoque.DISPONIVEL, orderBy);
  }

  async listarVendidos(orderBy: "asc" | "desc" = "asc") {
    return this.repo.listByStatusOrdered(StatusEstoque.VENDIDO, orderBy);
  }
}
