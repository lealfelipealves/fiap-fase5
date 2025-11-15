import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { AuthController } from "./auth.controller";
import { loginBodySchema, registerBodySchema } from "./auth.schemas";

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.withTypeProvider<ZodTypeProvider>().post("/register", {
    schema: {
      tags: ["Auth"],
      body: registerBodySchema,
    },
    handler: controller.register,
  });
  app.withTypeProvider<ZodTypeProvider>().post("/login", {
    schema: {
      tags: ["Auth"],
      body: loginBodySchema,
    },
    handler: controller.login,
  });
}
