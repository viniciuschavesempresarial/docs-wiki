import { MaterialCriadoEvent, MaterialAtualizadoEvent } from '@shared/contracts';
import { getRabbitMQChannel, PLATAFORMA_EXCHANGE } from '../config/rabbitmq.js';

export class RabbitMQEventPublisher {
  /**
   * Publica o evento de material criado na exchange 'plataforma.eventos'
   */
  public static async publishMaterialCriado(payload: MaterialCriadoEvent): Promise<boolean> {
    return this.publish('material.criado', payload);
  }

  /**
   * Publica o evento de material atualizado na exchange 'plataforma.eventos'
   */
  public static async publishMaterialAtualizado(payload: MaterialAtualizadoEvent): Promise<boolean> {
    return this.publish('material.atualizado', payload);
  }

  /**
   * Publica o evento de material excluído na exchange 'plataforma.eventos'
   */
  public static async publishMaterialExcluido(payload: { event: 'material.excluido'; material_id: string; timestamp: string }): Promise<boolean> {
    return this.publish('material.excluido', payload);
  }

  private static async publish(routingKey: string, message: unknown): Promise<boolean> {
    try {
      const channel = await getRabbitMQChannel();
      if (!channel) {
        console.warn(`[RabbitMQ] Canal indisponível. Mensagem '${routingKey}' não publicada.`);
        return false;
      }

      const contentBuffer = Buffer.from(JSON.stringify(message));
      const sent = channel.publish(PLATAFORMA_EXCHANGE, routingKey, contentBuffer, {
        persistent: true,
        contentType: 'application/json'
      });

      return sent;
    } catch (error) {
      console.error(`[RabbitMQ] Erro ao publicar mensagem na routing key '${routingKey}':`, error);
      return false;
    }
  }
}
