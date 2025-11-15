import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { authPlugin } from "./middlewares/auth";
import { errorHandler } from "./middlewares/error-handler";

import support from "@/plugins/support";
import swagger from "@/plugins/swagger";

import { authRoutes } from "@/modules/auth/auth.routes";
import { clientesRoutes } from "@/modules/clientes/clientes.routes";
import { veiculosRoutes } from "@/modules/veiculos/veiculos.routes";
import { vendasRoutes } from "@/modules/vendas/vendas.routes";

export function buildServer() {
  const app = Fastify({ logger: true });

  app.setErrorHandler(errorHandler);

  // plugins globais
  app.register(sensible);
  app.register(support);
  app.register(swagger);

  app.register(authPlugin);

  // rotas
  app.register(authRoutes, { prefix: "/auth" });
  app.register(clientesRoutes, { prefix: "/clientes" });
  app.register(veiculosRoutes, { prefix: "/veiculos" });
  app.register(vendasRoutes, { prefix: "/vendas" });

  return app;
}
