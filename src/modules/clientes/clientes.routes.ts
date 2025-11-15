import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { ClientesController } from "./clientes.controller";
import { createClienteBodySchema } from "./clientes.schemas";

export async function clientesRoutes(app: FastifyInstance) {
  const controller = new ClientesController();

  app.get("/", { schema: { tags: ["Clientes"] } }, controller.listar);

  app.withTypeProvider<ZodTypeProvider>().post(
    "/",
    {
      schema: {
        tags: ["Clientes"],
        body: createClienteBodySchema,
      },
    },
    controller.cadastrar
  );
}
