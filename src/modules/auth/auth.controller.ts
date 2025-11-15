import { FastifyReply, FastifyRequest } from "fastify";
import { loginBodySchema, registerBodySchema } from "./auth.schemas";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerBodySchema.parse(request.body);
    const cliente = await this.authService.registerCliente(body);
    return reply.code(201).send(cliente);
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginBodySchema.parse(request.body);
    const tokens = await this.authService.login(body);
    return reply.code(200).send(tokens);
  };
}
