import express from "express";
import { ConfigOptions, createConfig } from "@ravana/lib";
import router from "./pkg/router";
import { resolvers } from "./pkg/graphql";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Mongo } from "./pkg/mongo";

const app = express();

const configOption: ConfigOptions = {
  baseDir: __dirname,
  envFile: "/config/.env",
};

export const load = async () => {
  const config = createConfig(configOption);
  const env = config.getEnvironment();
  const logging = config.getLogging();
  const log = config.getLogging().getLogger();
  // const mongo = await config.getMongo().connect();
  const mongo = await new Mongo(env, logging).connect();
  const port = env.getStr("APP_PORT");
  const extended = `${env.getStr("APP_URL")}/${env.getStr("APP_VERSION")}`;

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());

  mongo.connection.on("error", (error) => {
    log.error(`MongoDB connection error: ${error}`);
    mongo.connection.createCollections();
    process.exit(-1);
  });

  const typeDefs = loadSchemaSync(__dirname + "/**/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  });
  log.debug("GraphQL schema loaded", { schema: JSON.stringify(typeDefs) });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  log.info("Apollo server loaded");
  app.use(extended, router);
  await apolloServer.start();

  app.get(`${extended}/health`, (req, res) => {
    res.status(200).json({
      status: "running",
      uptime: process.uptime(),
      // @ts-ignore
      memoryUsage: process.memoryUsage(),
      // @ts-ignore
      cpuUsage: process.cpuUsage(),
     });
  })

  app.all(
    `${extended}/graphql`,
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const userId = Array.isArray(req.headers["x-user-id"])
          ? req.headers["x-user-id"][0]
          : req.headers["x-user-id"];
        const clientId = Array.isArray(req.headers["x-client-id"])
          ? req.headers["x-client-id"][0]
          : req.headers["x-client-id"];
        return {
          clientId: clientId as string,
          userId: userId as string,
        };
      },
    })
  );

  const server = app.listen(port, () => {
    log.info(`App route: ${extended}`);
    log.info(`Server is running on port ${port}`);
  });
  
  process.on("SIGINT", async () => {
    log.info("SIGINT signal received. Shutting down gracefully...");
    server.close(async () => {
      log.info("HTTP server closed");
      try {
        await mongo.disconnect();
        log.info("MongoDB connection closed");
      } catch (error: any) {
        log.error("Error closing MongoDB connection", {
          msg: error.message,
        });
      }
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      log.error("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  });
};

load();