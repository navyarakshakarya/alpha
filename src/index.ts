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

export const initApp = async () => {
  const config = createConfig(configOption);
  const env = config.getEnvironment();
  const logging = config.getLogging();
  const log = config.getLogging().getLogger();
  // const mongo = await config.getMongo().connect();
  const mongo = await new Mongo(env,logging).connect();
  const port = env.getStr("APP_PORT");
  const extended = `${env.getStr("APP_URL")}${env.getStr("APP_VERSION")}`;

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(cookieParser());

  mongo.connection.on("error", (error) => {
    log.error(`MongoDB connection error: ${error}`);
    mongo.connection.createCollections()
    process.exit(-1);
  });

  const typeDefs = loadSchemaSync(__dirname +"/**/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  });
  log.debug("GraphQL schema loaded", { schema: JSON.stringify(typeDefs) });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  log.info("Apollo server loaded");
  await apolloServer.start();
  app.all("/graphql", expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      const userId = Array.isArray(req.headers["x-user-id"]) ? req.headers["x-user-id"][0] : req.headers["x-user-id"];
      return {
        userId: userId as string, 
      };
    },
  }));

  app.use(extended, router);
  app.listen(port, () => {
    log.debug(`App route: ${extended}`);
    log.info(`Server is running on port ${port}`);
  });
};
