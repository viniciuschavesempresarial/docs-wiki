import { MaterialDiffResponse } from '@shared/contracts';
import { VersionRepository } from '../repositories/version.repository.js';
import { calculateLineDiff } from '../parser/diffCalculator.js';
import { NotFoundError, BadRequestError } from './gitLike.service.js';

export class DiffService {
  /**
   * GET /materials/:id/diff?v1=1&v2=2: Calcula o diff estruturado entre duas versões
   */
  public static async getDiff(
    materialId: string,
    v1Num: number,
    v2Num: number
  ): Promise<MaterialDiffResponse> {
    if (!v1Num || !v2Num || v1Num < 1 || v2Num < 1) {
      throw new BadRequestError('Os parâmetros de versão v1 e v2 devem ser números inteiros positivos.');
    }

    const version1 = await VersionRepository.findByMaterialAndVersionNum(materialId, v1Num);
    if (!version1) {
      throw new NotFoundError(`Versão ${v1Num} não encontrada para o material '${materialId}'.`);
    }

    const version2 = await VersionRepository.findByMaterialAndVersionNum(materialId, v2Num);
    if (!version2) {
      throw new NotFoundError(`Versão ${v2Num} não encontrada para o material '${materialId}'.`);
    }

    return calculateLineDiff(
      materialId,
      v1Num,
      v2Num,
      version1.conteudo_okf,
      version2.conteudo_okf
    );
  }
}
