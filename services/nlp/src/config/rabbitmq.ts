import amqplib from 'amqplib';
import { env } from './env.config.js';

export const EXCHANGE_NAME = 'plataforma.eventos';
export const QUEUE_NAME = 'nlp_processamento_queue';
export const ROUTING_KEYS = ['material.criado', 'material.atualizado'];

export class RabbitMQManager {
  private connection: amqplib.ChannelModel | null = null;
  private channel: amqplib.Channel | null = null;

  public async connectRabbitMQ(): Promise<{ connection: amqplib.ChannelModel; channel: amqplib.Channel }> {
    if (this.connection && this.channel) {
      return { connection: this.connection, channel: this.channel };
    }

    try {
      this.connection = await amqplib.connect(env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
      await this.channel.assertQueue(QUEUE_NAME, {
        durable: true,
        arguments: {
          'x-max-priority': 10
        }
      });

      for (const key of ROUTING_KEYS) {
        await this.channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
      }

      await this.channel.prefetch(5);

      console.log(`[RABBITMQ:NLP] Fila '${QUEUE_NAME}' vinculada com sucesso à exchange '${EXCHANGE_NAME}'.`);

      this.connection.on('error', (err) => {
        console.error('[RABBITMQ:NLP] Erro na conexão RabbitMQ:', err);
      });

      this.connection.on('close', () => {
        console.warn('[RABBITMQ:NLP] Conexão com RabbitMQ fechada. Tentando reconectar...');
        this.connection = null;
        this.channel = null;
      });

      return { connection: this.connection, channel: this.channel };
    } catch (error) {
      console.error('[RABBITMQ:NLP] Falha ao conectar ao RabbitMQ:', error);
      throw error;
    }
  }

  public async publishEvent(routingKey: string, payload: unknown): Promise<boolean> {
    try {
      if (!this.channel) {
        const conn = await this.connectRabbitMQ();
        this.channel = conn.channel;
      }

      const messageBuffer = Buffer.from(JSON.stringify(payload));
      return this.channel.publish(EXCHANGE_NAME, routingKey, messageBuffer, {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`[RABBITMQ:NLP] Erro ao publicar evento na routing key '${routingKey}':`, error);
      return false;
    }
  }

  public async closeRabbitMQ(): Promise<void> {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (error) {
      console.error('[RABBITMQ:NLP] Erro ao fechar conexão RabbitMQ:', error);
    } finally {
      this.channel = null;
      this.connection = null;
    }
  }
}

export const rabbitmqManager = new RabbitMQManager();

export const connectRabbitMQ = () => rabbitmqManager.connectRabbitMQ();
export const publishEvent = (routingKey: string, payload: unknown) =>
  rabbitmqManager.publishEvent(routingKey, payload);
export const closeRabbitMQ = () => rabbitmqManager.closeRabbitMQ();
