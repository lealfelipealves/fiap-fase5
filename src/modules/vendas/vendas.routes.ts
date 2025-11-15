import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { VendasController } from "./vendas.controller";
import {
  cancelarVendaBodySchema,
  idParamSchema,
  listarVendasQuerySchema,
  reservaVeiculoBodySchema,
} from "./vendas.schemas";

export async function vendasRoutes(app: FastifyInstance) {
  const controller = new VendasController();

  app.addHook("onRequest", app.authenticate);

  // POST /vendas/reservar
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/reservar",
    schema: {
      tags: ["Vendas"],
      body: reservaVeiculoBodySchema,
    },
    handler: controller.reservar,
  });

  // POST /vendas/:id/codigo-pagamento
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/codigo-pagamento",
    schema: {
      tags: ["Vendas"],
      params: idParamSchema,
    },
    handler: controller.gerarCodigoPagamento,
  });

  // POST /vendas/:id/confirmar-pagamento
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/confirmar-pagamento",
    schema: {
      tags: ["Vendas"],
      params: idParamSchema,
    },
    handler: controller.confirmarPagamento,
  });

  // POST /vendas/:id/retirar
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/retirar",
    schema: {
      tags: ["Vendas"],
      params: idParamSchema,
    },
    handler: controller.marcarRetirada,
  });

  // POST /vendas/:id/cancelar
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/:id/cancelar",
    schema: {
      tags: ["Vendas"],
      params: idParamSchema,
      body: cancelarVendaBodySchema,
    },
    handler: controller.cancelar,
  });

  // GET /vendas?status=PAGO
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/",
    schema: {
      tags: ["Vendas"],
      querystring: listarVendasQuerySchema,
    },
    handler: controller.listar,
  });

  // GET /vendas/:id
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/:id",
    schema: {
      tags: ["Vendas"],
      params: idParamSchema,
    },
    handler: controller.obterPorId,
  });

  // POST /vendas/checkout-completo
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/checkout-completo",
    schema: {
      tags: ["Vendas"],
      body: reservaVeiculoBodySchema,
    },
    handler: controller.checkoutCompleto,
  });
}
