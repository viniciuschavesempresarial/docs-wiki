import { jest } from '@jest/globals';
import amqplib from 'amqplib';
import { MaterialCriadoEvent } from '@shared/contracts';
import { nlpService } from '../src/services/nlp.service.js';
import { rabbitmqManager } from '../src/config/rabbitmq.js';
import { startNLPConsumer, stopNLPConsumer } from '../src/consumer/nlp.consumer.js';

describe('NLPConsumer (RabbitMQ Worker Consumer)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await stopNLPConsumer();
  });

  it('deve consumir mensagem válida, chamar nlpService e enviar ACK', async () => {
    const processSpy = jest
      .spyOn(nlpService, 'processMaterialEvent')
      .mockImplementation(async () => ({
        material_id: 'test-id',
        versao_num: 1,
        chunks_count: 2,
        words_count: 50,
        bytes_count: 200,
        success: true
      }));

    let messageHandler: ((msg: amqplib.ConsumeMessage | null) => Promise<void>) | null = null;

    const mockChannel = {
      consume: jest.fn<any>().mockImplementation((_queue: string, handler: any) => {
        messageHandler = handler;
        return { consumerTag: 'test-consumer-tag' };
      }),
      cancel: jest.fn<any>().mockResolvedValue({}),
      ack: jest.fn<any>(),
      nack: jest.fn<any>()
    };

    jest.spyOn(rabbitmqManager, 'connectRabbitMQ').mockResolvedValue({
      connection: {} as any,
      channel: mockChannel as any
    });

    await startNLPConsumer();

    expect(mockChannel.consume).toHaveBeenCalledTimes(1);
    expect(messageHandler).toBeDefined();

    const sampleEvent: MaterialCriadoEvent = {
      event: 'material.criado',
      material_id: '12345678-1234-1234-1234-123456789012',
      versao_num: 1,
      slug: 'teste-slug',
      titulo: 'Título Teste',
      autor: 'Autor Teste',
      autor_id: '11111111-1111-1111-1111-111111111111',
      categoria: 'Dev',
      tipo: 'Doc',
      tags: ['teste'],
      conteudo_okf: '# Teste\nConteúdo teste',
      timestamp: new Date().toISOString()
    };

    const mockMessage: amqplib.ConsumeMessage = {
      content: Buffer.from(JSON.stringify(sampleEvent)),
      fields: {
        deliveryTag: 1,
        redelivered: false,
        exchange: 'plataforma.eventos',
        routingKey: 'material.criado',
        consumerTag: 'test-consumer-tag'
      },
      properties: {} as any
    };

    if (messageHandler) {
      await (messageHandler as (msg: amqplib.ConsumeMessage | null) => Promise<void>)(mockMessage);
    }

    expect(processSpy).toHaveBeenCalledTimes(1);
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it('deve enviar NACK para mensagens com formato inválido', async () => {
    let messageHandler: ((msg: amqplib.ConsumeMessage | null) => Promise<void>) | null = null;

    const mockChannel = {
      consume: jest.fn<any>().mockImplementation((_queue: string, handler: any) => {
        messageHandler = handler;
        return { consumerTag: 'test-consumer-tag-2' };
      }),
      cancel: jest.fn<any>().mockResolvedValue({}),
      ack: jest.fn<any>(),
      nack: jest.fn<any>()
    };

    jest.spyOn(rabbitmqManager, 'connectRabbitMQ').mockResolvedValue({
      connection: {} as any,
      channel: mockChannel as any
    });

    await startNLPConsumer();

    const mockInvalidMessage: amqplib.ConsumeMessage = {
      content: Buffer.from(JSON.stringify({ event: 'evento.invalido' })),
      fields: {
        deliveryTag: 2,
        redelivered: false,
        exchange: 'plataforma.eventos',
        routingKey: 'evento.invalido',
        consumerTag: 'test-consumer-tag-2'
      },
      properties: {} as any
    };

    if (messageHandler) {
      await (messageHandler as (msg: amqplib.ConsumeMessage | null) => Promise<void>)(mockInvalidMessage);
    }

    expect(mockChannel.nack).toHaveBeenCalledWith(mockInvalidMessage, false, false);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
