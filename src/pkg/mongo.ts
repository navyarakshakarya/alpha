import mongoose, { connect, disconnect, Mongoose } from "mongoose";
import { toUri } from "../utils/string";
import { Environment, Logging } from "@ravana/lib";

export class Mongo {
  private mongoConnection: Mongoose | null = null;

  constructor(private environment: Environment, private logging: Logging) {}

  public async connect(): Promise<Mongoose> {
    if (this.mongoConnection) {
      return this.mongoConnection;
    }
    let connectionString = "";
    try {
      const host = this.environment.getStr("MONGO_HOST");
      const port = this.environment.getStr("MONGO_PORT");
      const user = this.environment.getStr("MONGO_USER");
      const pass = toUri(this.environment.getStr("MONGO_PASS"));
      const dbName = this.environment.getStr("MONGO_DB_NAME");
      const dbAuthSource = this.environment.getStr("MONGO_DB_AUTH_SOURCE");
      connectionString = `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=${dbAuthSource}`;
      this.logging.getLogger().debug("Mongo Config", { connectionString });
    } catch (error: any) {
      this.logging.getLogger().error("Mongo Config Error", {
        msg: error.message,
        stack: error.stack,
      });
      throw error;
    }
    try {
      this.mongoConnection = await mongoose.connect(connectionString);
      this.logging.getLogger().debug("mc: ", { conn: this.mongoConnection });
      this.logging.getLogger().info("MongoDB connected successfully");
      return this.mongoConnection;
    } catch (error: any) {
      this.logging.getLogger().error("Error connecting to MongoDB", {
        msg: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.mongoConnection) {
      disconnect();
      await this.mongoConnection.disconnect();
      this.mongoConnection = null;
      this.logging.getLogger().info("MongoDB disconnected successfully");
    }
  }
}
