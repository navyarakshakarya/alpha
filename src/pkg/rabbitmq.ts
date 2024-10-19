import amqp from "amqplib";
import { Environment, Logging } from "@ravana/lib";

export class RabbitMQ {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private environment: Environment, private logging: Logging) {}

  async connect() {
    this.connection = await amqp.connect(
      this.environment.getStr("RABBITMQ_URL")
    );
    this.channel = await this.connection.createChannel();
    this.logging.getLogger().info("RabbitMQ connected successfully");
  }

  async publishMessage(queue: string, message: any) {
    if (!this.channel) {
      await this.connect();
    }
    await this.channel!.assertQueue(queue);
    this.channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    this.logging.getLogger().info("rabbitmq:message_published", {
      queue,
      message,
    });
  }

  async consumeMessage(queue: string, callback: (message: any) => void) {
    if (!this.channel) {
      await this.connect();
    }
    await this.channel!.assertQueue(queue);
    this.channel!.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel!.ack(msg);
      }
    });
    this.logging.getLogger().info("rabbitmq:message_consumed", {
      queue,
    });
  }
}
