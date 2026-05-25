import "dotenv/config";
import { app } from "./app";

const SERVER_PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
function main() {
  const gracefulShutdown = (signal: any) => {
    console.log(`Received ${signal}. Closing server and connections...`);

    app
      .close()
      .then(() => {
        console.log("Server and all resources have been closed gracefully.");

        if (signal === "SIGUSR2") {
          process.kill(process.pid, "SIGUSR2");
        } else {
          process.exit(0);
        }
      })
      .catch((err) => {
        console.error("Error during shutdown:", err);
        process.exit(1);
      });
  };

  app.listen({ port: SERVER_PORT, host: "0.0.0.0" }, async (err: Error | null, address: string) => {
    if (err) {
      console.error(err);
      throw err;
    }

    console.log(`Server is running on: ${address}`);
  });

  // Intercept SIGINT and SIGTERM signals
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  // Handle SIGUSR2 separately for development restarts
  process.once("SIGUSR2", () => gracefulShutdown("SIGUSR2"));
}

main();
