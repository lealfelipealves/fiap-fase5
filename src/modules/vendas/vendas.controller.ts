import { CompraVeiculoSaga } from "@/core/saga/compra-veiculo.saga";
import { StatusVenda } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { getCurrentCliente } from "../../core/security/current-cliente";
import {
  cancelarVendaBodySchema,
  idParamSchema,
  listarVendasQuerySchema,
  reservaVeiculoBodySchema,
} from "./vendas.schemas";
import { VendasService } from "./vendas.service";

export class VendasController {
  private vendasService: VendasService;

  constructor(vendasService = new VendasService()) {
    this.vendasService = vendasService;
  }

  reservar = async (request: FastifyRequest, reply: FastifyReply) => {
    const cliente = await getCurrentCliente(request);
    const body = reservaVeiculoBodySchema.parse(request.body);
    const venda = await this.vendasService.reservarVeiculo({
      clienteId: cliente.id,
      veiculoId: body.veiculoId,
    });
    return reply.code(201).send(venda);
  };

  gerarCodigoPagamento = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { id } = idParamSchema.parse(request.params);
    const venda = await this.vendasService.gerarCodigoPagamento(id);
    return reply.code(200).send(venda);
  };

  confirmarPagamento = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const venda = await this.vendasService.confirmarPagamento(id);
    return reply.code(200).send(venda);
  };

  marcarRetirada = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const venda = await this.vendasService.marcarRetirada(id);
    return reply.code(200).send(venda);
  };

  cancelar = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const body = cancelarVendaBodySchema.parse(request.body);
    const venda = await this.vendasService.cancelarVenda(id, body.motivo);
    return reply.code(200).send(venda);
  };

  listar = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listarVendasQuerySchema.parse(request.query);
    const vendas = await this.vendasService.listarVendas(
      query.status as StatusVenda | undefined
    );
    return reply.code(200).send(vendas);
  };

  obterPorId = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = idParamSchema.parse(request.params);
    const venda = await this.vendasService.obterPorId(id);

    if (!venda) {
      return reply.code(404).send({ message: "Venda não encontrada" });
    }

    return reply.code(200).send(venda);
  };

  checkoutCompleto = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = reservaVeiculoBodySchema.parse(request.body);

    const saga = new CompraVeiculoSaga();
    const result = await saga.executarCompra({
      clienteId: body.clienteId,
      veiculoId: body.veiculoId,
    });

    if (!result.sucesso) {
      return reply.status(400).send({
        message: "Falha no processo de compra",
        etapaFalha: result.etapaFalha,
        motivo: result.motivoFalha,
      });
    }

    return reply.status(201).send(result.venda);
  };
}
