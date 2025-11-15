import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateVeiculoBody,
  ListVeiculosQuery,
  UpdateVeiculoBody,
} from "./veiculos.schemas";
import { VeiculosService } from "./veiculos.service";

export class VeiculosController {
  constructor(private readonly service = new VeiculosService()) {}

  cadastrar = async (
    request: FastifyRequest<{ Body: CreateVeiculoBody }>,
    reply: FastifyReply
  ) => {
    const veiculo = await this.service.cadastrarVeiculo(request.body);
    return reply.code(201).send(veiculo);
  };

  editar = async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateVeiculoBody;
    }>,
    reply: FastifyReply
  ) => {
    const id = request.params.id;
    const veiculo = await this.service.editarVeiculo(id, request.body);
    return reply.send(veiculo);
  };

  listar = async (
    request: FastifyRequest<{ Querystring: ListVeiculosQuery }>,
    reply: FastifyReply
  ) => {
    const { status, orderBy } = request.query;

    if (status === "VENDIDO") {
      const vendidos = await this.service.listarVendidos(orderBy);
      return reply.send(vendidos);
    }

    const disponiveis = await this.service.listarDisponiveis(orderBy);
    return reply.send(disponiveis);
  };
}
