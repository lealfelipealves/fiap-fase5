import { FastifyReply, FastifyRequest } from "fastify";
import { CreateClienteBody } from "./clientes.schemas";
import { ClientesService } from "./clientes.service";

export class ClientesController {
  constructor(private readonly service = new ClientesService()) {}

  cadastrar = async (
    request: FastifyRequest<{ Body: CreateClienteBody }>,
    reply: FastifyReply
  ) => {
    const cliente = await this.service.cadastrarCliente(request.body);
    return reply.code(201).send(cliente);
  };

  listar = async (_: FastifyRequest, reply: FastifyReply) => {
    const clientes = await this.service.listarClientes();
    return reply.send(clientes);
  };
}
