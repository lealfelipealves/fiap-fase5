import { StatusEstoque, StatusVenda, Venda } from "@prisma/client";
import { prisma } from "../../infra/prisma/client";
import { VendasRepository } from "./vendas.repository";
import { ReservaVeiculoBody } from "./vendas.schemas";

export class VendasService {
  private vendasRepository: VendasRepository;

  constructor(vendasRepository = new VendasRepository()) {
    this.vendasRepository = vendasRepository;
  }

  /**
   * Etapa 1: reservar veículo
   */
  async reservarVeiculo(body: ReservaVeiculoBody): Promise<Venda> {
    const { clienteId, veiculoId } = body;

    // tudo dentro de transação p/ garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      const veiculo = await tx.veiculo.findUnique({
        where: { id: veiculoId },
      });

      if (!veiculo) {
        throw new Error("Veículo não encontrado");
      }

      if (veiculo.statusEstoque !== StatusEstoque.DISPONIVEL) {
        throw new Error("Veículo não está disponível para reserva");
      }

      // marca veículo como reservado
      await tx.veiculo.update({
        where: { id: veiculoId },
        data: { statusEstoque: StatusEstoque.RESERVADO },
      });

      // cria venda com status RESERVADO
      const venda = await tx.venda.create({
        data: {
          cliente: { connect: { id: clienteId } },
          veiculo: { connect: { id: veiculoId } },
          status: StatusVenda.RESERVADO,
        },
      });

      return venda;
    });

    return result;
  }

  /**
   * Etapa 2: gerar código de pagamento (simulação)
   */
  async gerarCodigoPagamento(vendaId: string): Promise<Venda> {
    const venda = await this.vendasRepository.findById(vendaId);

    if (!venda) throw new Error("Venda não encontrada");
    if (venda.status !== StatusVenda.RESERVADO) {
      throw new Error("Só é possível gerar código para vendas reservadas");
    }

    const codigo = `PAY-${venda.id.slice(0, 8)}-${Date.now()
      .toString(36)
      .toUpperCase()}`;

    return this.vendasRepository.updateStatus(
      vendaId,
      StatusVenda.CODIGO_GERADO,
      codigo
    );
  }

  /**
   * Etapa 3: confirmar pagamento
   */
  async confirmarPagamento(vendaId: string): Promise<Venda> {
    const venda = await this.vendasRepository.findById(vendaId);

    if (!venda) throw new Error("Venda não encontrada");
    if (venda.status !== StatusVenda.CODIGO_GERADO) {
      throw new Error(
        "Só é possível confirmar pagamento de vendas com código gerado"
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      // marca venda como paga
      const v = await tx.venda.update({
        where: { id: vendaId },
        data: {
          status: StatusVenda.PAGO,
        },
      });

      // marca veículo como vendido
      await tx.veiculo.update({
        where: { id: v.veiculoId },
        data: { statusEstoque: StatusEstoque.VENDIDO },
      });

      return v;
    });

    return updated;
  }

  /**
   * Etapa 4: retirada do veículo
   */
  async marcarRetirada(vendaId: string): Promise<Venda> {
    const venda = await this.vendasRepository.findById(vendaId);

    if (!venda) throw new Error("Venda não encontrada");
    if (venda.status !== StatusVenda.PAGO) {
      throw new Error("Só é possível marcar retirada de vendas pagas");
    }

    return this.vendasRepository.updateStatus(vendaId, StatusVenda.RETIRADO);
  }

  /**
   * Cancelar venda (em qualquer etapa até ser RETIRADO)
   */
  async cancelarVenda(vendaId: string, motivo?: string): Promise<Venda> {
    const venda = await this.vendasRepository.findById(vendaId);

    if (!venda) throw new Error("Venda não encontrada");
    if (venda.status === StatusVenda.RETIRADO) {
      throw new Error(
        "Não é possível cancelar uma venda já concluída (RETIRADO)"
      );
    }
    if (venda.status === StatusVenda.CANCELADO) {
      throw new Error("Venda já está cancelada");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.venda.update({
        where: { id: vendaId },
        data: {
          status: StatusVenda.CANCELADO,
          // se quiser guardar motivo em outra tabela/histórico, aqui é o lugar
        },
      });

      // volta veículo para DISPONIVEL (guards acima já garantem que status não é RETIRADO)
      await tx.veiculo.update({
        where: { id: v.veiculoId },
        data: { statusEstoque: StatusEstoque.DISPONIVEL },
      });

      return v;
    });

    return updated;
  }

  async listarVendas(status?: StatusVenda): Promise<Venda[]> {
    return this.vendasRepository.listByStatusOrdered(status);
  }

  async obterPorId(id: string): Promise<Venda | null> {
    return this.vendasRepository.findById(id);
  }
}
