import { cognitoVerifier } from "@/core/security/cognito-verifier";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      sub: string;
      email?: string;
      [key: string]: any;
    };
  }
}

async function authMiddleware(app: FastifyInstance) {
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return reply
          .status(401)
          .send({ message: "Token não enviado ou inválido" });
      }

      const token = authHeader.substring("Bearer ".length);

      try {
        const payload = await cognitoVerifier.verify(token);

        // Prevent 'sub' or 'email' from being overwritten by ...payload
        const { sub, email, ...rest } = payload;
        request.user = {
          sub: sub as string,
          email: email as string | undefined,
          ...rest,
        };
      } catch (err) {
        request.log.error({ err }, "Erro ao verificar token Cognito");
        return reply.status(401).send({ message: "Token inválido" });
      }
    }
  );
}

export const authPlugin = fp(authMiddleware);

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
