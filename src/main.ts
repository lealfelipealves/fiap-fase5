import { buildServer } from "./app/http/server";

async function start() {
  const app = buildServer();

  await app.listen({ port: 3333, host: "0.0.0.0" });
  console.log("🚀 Server rodando em http://localhost:3333");
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
