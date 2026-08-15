import { Request, Response, NextFunction } from 'express';
import { ChatRequestDTOSchema } from '@shared/contracts';
import { ragChatService } from '../services/rag-chat.service.js';

export async function chatHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = ChatRequestDTOSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Payload inválido para o chat RAG',
        details: parseResult.error.flatten()
      });
      return;
    }

    const result = await ragChatService.executeChat(parseResult.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
