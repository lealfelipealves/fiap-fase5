// src/core/saga/compra-veiculo.saga.ts

import { StatusVenda, Venda } from "@prisma/client";
import { VendasService } from "../../modules/vendas/vendas.service";

/**
 * Input mínimo para orquestrar a compra:
 * - clienteId: quem está comprando
 * - veiculoId: veículo escolhido
 */
export interface CompraVeiculoInput {
  clienteId: string;
  veiculoId: string;
}

/**
 * Resultado final da SAGA de compra.
 * Pode ser:
 * - sucesso (RETIRADO)
 * - falha em alguma etapa (com status final CANCELADO ou outro)
 */
export interface CompraVeiculoResult {
  sucesso: boolean;
  venda?: Venda;
  etapaFalha?: SagaStep;
  motivoFalha?: string;
}

export enum SagaStep {
  RESERVA = "RESERVA",
  CODIGO_PAGAMENTO = "CODIGO_PAGAMENTO",
  PAGAMENTO = "PAGAMENTO",
  RETIRADA = "RETIRADA",
}

/**
 * Classe responsável por ORQUESTRAR o fluxo de compra
 * como uma SAGA com passos bem definidos.
 *
 * Ela usa o VendasService por baixo dos panos, mas deixa bem claro
 * o fluxo de alto nível que você pode descrever no PDF.
 */
export class CompraVeiculoSaga {
  private vendasService: VendasService;

  constructor(vendasService = new VendasService()) {
    this.vendasService = vendasService;
  }

  /**
   * Executa a SAGA completa:
   * 1) Reserva veículo
   * 2) Gera código de pagamento
   * 3) Confirma pagamento
   * 4) Marca retirada
   *
   * Se alguma etapa falhar, dispara compensações apropriadas:
   * - Se falhar após reserva/código: cancela venda (libera veículo)
   * - Se falhar após pagamento confirmado: NÃO cancela automaticamente (requer intervenção manual)
   */
  async executarCompra(
    input: CompraVeiculoInput
  ): Promise<CompraVeiculoResult> {
    let venda: Venda | null = null;
    let etapaAtual: SagaStep | undefined;

    try {
      // 1) RESERVA
      etapaAtual = SagaStep.RESERVA;
      venda = await this.vendasService.reservarVeiculo({
        clienteId: input.clienteId,
        veiculoId: input.veiculoId,
      });

      // 2) GERA CÓDIGO DE PAGAMENTO
      etapaAtual = SagaStep.CODIGO_PAGAMENTO;
      venda = await this.vendasService.gerarCodigoPagamento(venda.id);

      // 3) CONFIRMA PAGAMENTO
      etapaAtual = SagaStep.PAGAMENTO;
      venda = await this.vendasService.confirmarPagamento(venda.id);

      // 4) MARCA RETIRADA
      etapaAtual = SagaStep.RETIRADA;
      venda = await this.vendasService.marcarRetirada(venda.id);

      return {
        sucesso: true,
        venda,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido na SAGA de compra";

      // Compensações: se a venda chegou a existir, tenta cancelar
      if (venda && venda.id) {
        try {
          // Busca status atual da venda antes de tentar cancelar
          const vendaAtual = await this.vendasService.obterPorId(venda.id);

          // Só cancela se não foi paga nem retirada (pagamento confirmado não é revertível)
          if (
            vendaAtual &&
            vendaAtual.status !== StatusVenda.PAGO &&
            vendaAtual.status !== StatusVenda.RETIRADO &&
            vendaAtual.status !== StatusVenda.CANCELADO
          ) {
            await this.vendasService.cancelarVenda(
              venda.id,
              `SAGA_FAIL: ${message}`
            );
          } else if (vendaAtual && vendaAtual.status === StatusVenda.PAGO) {
            // Log crítico: pagamento confirmado mas processo falhou
            console.error(
              `SAGA CRITICAL: Pagamento confirmado mas processo falhou. VendaId: ${venda.id}, Etapa: ${etapaAtual}, Erro: ${message}`
            );
          }
        } catch (compensationError) {
          // Log crítico: falha na compensação
          const compensationMessage =
            compensationError instanceof Error
              ? compensationError.message
              : "Erro desconhecido";
          console.error(
            `SAGA COMPENSATION FAILED: VendaId: ${venda.id}, Erro Original: ${message}, Erro Compensação: ${compensationMessage}`
          );
        }
      }

      return {
        sucesso: false,
        venda: venda ?? undefined,
        etapaFalha: etapaAtual,
        motivoFalha: message,
      };
    }
  }

  /**
   * Exemplo de execução parcial da SAGA:
   * até a geração do código de pagamento.
   *
   * Útil se você quiser expor endpoints separados no controller:
   * - POST /vendas/reservar (usa VendasService direto)
   * - POST /vendas/checkout (usa SAGA até gerar código)
   */
  async executarAteCodigoPagamento(
    input: CompraVeiculoInput
  ): Promise<CompraVeiculoResult> {
    let venda: Venda | null = null;
    let etapaAtual: SagaStep | undefined;

    try {
      etapaAtual = SagaStep.RESERVA;
      venda = await this.vendasService.reservarVeiculo({
        clienteId: input.clienteId,
        veiculoId: input.veiculoId,
      });

      etapaAtual = SagaStep.CODIGO_PAGAMENTO;
      venda = await this.vendasService.gerarCodigoPagamento(venda.id);

      return {
        sucesso: true,
        venda,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido na SAGA (até código)";

      if (venda && venda.id) {
        try {
          // Busca status atual antes de cancelar
          const vendaAtual = await this.vendasService.obterPorId(venda.id);

          if (
            vendaAtual &&
            vendaAtual.status !== StatusVenda.RETIRADO &&
            vendaAtual.status !== StatusVenda.CANCELADO
          ) {
            await this.vendasService.cancelarVenda(
              venda.id,
              `SAGA_FAIL: ${message}`
            );
          }
        } catch (compensationError) {
          const compensationMessage =
            compensationError instanceof Error
              ? compensationError.message
              : "Erro desconhecido";
          console.error(
            `SAGA COMPENSATION FAILED (parcial): VendaId: ${venda.id}, Erro Original: ${message}, Erro Compensação: ${compensationMessage}`
          );
        }
      }

      return {
        sucesso: false,
        venda: venda ?? undefined,
        etapaFalha: etapaAtual,
        motivoFalha: message,
      };
    }
  }
}
