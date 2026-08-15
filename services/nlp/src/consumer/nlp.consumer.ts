import amqplib from 'amqplib';
import { MaterialCriadoEvent, MaterialAtualizadoEvent } from '@shared/contracts';
import { connectRabbitMQ, QUEUE_NAME } from '../config/rabbitmq.js';
import { nlpService } from '../services/nlp.service.js';
import { indicesRepository } from '../repositories/indices.repository.js';

let activeConsumerTag: string | null = null;

export async function startNLPConsumer(): Promise<void> {
  const { channel } = await connectRabbitMQ();

  console.log(`[NLP_CONSUMER] Iniciando escuta de mensagens na fila '${QUEUE_NAME}'...`);

  const response = await channel.consume(
    QUEUE_NAME,
    async (msg: amqplib.ConsumeMessage | null) => {
      if (!msg) return;

      const messageContent = msg.content.toString('utf8');
      const routingKey = msg.fields.routingKey;

      try {
        console.log(`[NLP_CONSUMER] Mensagem recebida [RoutingKey: ${routingKey}]`);
        const payload = JSON.parse(messageContent) as { event?: string; material_id?: string; [key: string]: any };

        if (payload.event === 'material.criado' || payload.event === 'material.atualizado') {
          await nlpService.processMaterialEvent(payload as MaterialCriadoEvent | MaterialAtualizadoEvent);
          channel.ack(msg);
          console.log(`[NLP_CONSUMER] Mensagem processada e confirmada (ACK) com sucesso [ID: ${payload.material_id}]`);
        } else if (payload.event === 'material.excluido' && payload.material_id) {
          await indicesRepository.deleteIndice(payload.material_id);
          channel.ack(msg);
          console.log(`[NLP_CONSUMER] Material expurgado dos índices de busca com sucesso [ID: ${payload.material_id}]`);
        } else {
          console.warn(`[NLP_CONSUMER] Tipo de evento desconhecido: ${String(payload?.event)}. Descartando mensagem.`);
          channel.nack(msg, false, false);
        }
      } catch (error) {
        console.error('[NLP_CONSUMER] Erro crítico ao processar mensagem da fila:', error);
        // Em caso de falha de processamento irrecuperável, envia NACK sem requeue para evitar loop infinito
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  activeConsumerTag = response.consumerTag;
}

export async function stopNLPConsumer(): Promise<void> {
  if (activeConsumerTag) {
    const { channel } = await connectRabbitMQ();
    await channel.cancel(activeConsumerTag);
    activeConsumerTag = null;
    console.log('[NLP_CONSUMER] Consumidor de fila cancelado com sucesso.');
  }
}
