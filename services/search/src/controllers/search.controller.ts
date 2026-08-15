import { Request, Response, NextFunction } from 'express';
import { SearchQueryDTOSchema } from '@shared/contracts';
import { hybridSearchService } from '../services/hybrid-search.service.js';

export async function searchHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = SearchQueryDTOSchema.safeParse(req.query);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Parâmetros de busca inválidos',
        details: parseResult.error.flatten()
      });
      return;
    }

    const result = await hybridSearchService.executeSearch(parseResult.data);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
