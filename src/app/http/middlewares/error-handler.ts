import { FastifyReply, FastifyRequest } from "fastify";

export const errorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.error(error);
  reply.status(500).send({ message: "Internal server error" });
};
