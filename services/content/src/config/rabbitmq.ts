import amqp from 'amqplib';
import { config } from './env.js';

export const PLATAFORMA_EXCHANGE = 'plataforma.eventos';

type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;

export async function getRabbitMQChannel(): Promise<AmqpChannel | null> {
  if (channel) {
    return channel;
  }

  try {
    const conn = await amqp.connect(config.rabbitmqUrl);
    connection = conn;
    const ch = await conn.createChannel();
    channel = ch;

    await ch.assertExchange(PLATAFORMA_EXCHANGE, 'topic', {
      durable: true
    });

    conn.on('error', (err) => {
      console.error('Erro na conexão RabbitMQ:', err);
      channel = null;
      connection = null;
    });

    conn.on('close', () => {
      console.warn('Conexão com RabbitMQ encerrada');
      channel = null;
      connection = null;
    });

    return channel;
  } catch (error) {
    console.error('Falha ao conectar no RabbitMQ:', error);
    return null;
  }
}

export async function closeRabbitMQ(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (err) {
    console.error('Erro ao fechar conexão RabbitMQ:', err);
  }
}
