import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { VeiculosController } from "./veiculos.controller";
import {
  createVeiculoBodySchema,
  idParamSchema,
  listVeiculosQuerySchema,
  updateVeiculoBodySchema,
} from "./veiculos.schemas";

export async function veiculosRoutes(app: FastifyInstance) {
  const controller = new VeiculosController();

  app.addHook("onRequest", app.authenticate);

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Veículos"],
      querystring: listVeiculosQuerySchema,
      security: [{ bearerAuth: [] }],
    },
    handler: controller.listar,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/",
    schema: {
      tags: ["Veículos"],
      body: createVeiculoBodySchema,
      security: [{ bearerAuth: [] }],
    },
    handler: controller.cadastrar,
  });

  app.withTypeProvider<ZodTypeProvider>().route({
    method: "PUT",
    url: "/:id",
    schema: {
      tags: ["Veículos"],
      body: updateVeiculoBodySchema,
      params: idParamSchema,
      security: [{ bearerAuth: [] }],
    },
    handler: controller.editar,
  });
}
