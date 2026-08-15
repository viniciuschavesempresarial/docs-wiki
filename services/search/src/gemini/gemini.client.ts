import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.config.js';

export interface GroundingContextItem {
  documentTitle: string;
  sectionTitle?: string;
  content: string;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey = env.GEMINI_API_KEY, modelName = env.GEMINI_MODEL) {
    this.modelName = modelName;
    if (apiKey && apiKey !== 'mock_gemini_api_key' && apiKey !== 'sua_gemini_api_key_aqui') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
      } catch (err) {
        console.warn('[GEMINI:CLIENT] Aviso: Não foi possível inicializar o cliente Gemini SDK:', (err as Error).message);
      }
    }
  }

  /**
   * Gera um resumo sintético dos resultados de busca com base nos chunks mais relevantes.
   */
  public async summarizeSearchResults(query: string, contextTexts: string[]): Promise<string> {
    if (!this.genAI) {
      return `Resumo sintético gerado para a busca "${query}": Com base nos documentos recuperados, o conteúdo aborda os principais conceitos relacionados à pesquisa, cobrindo especificações técnicas e diretrizes de arquitetura.`;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { temperature: 0.3 }
      });

      const prompt = `Você é o assistente de busca da plataforma Docs-Wiki.
Sintetize uma resposta clara, concisa e direta para a seguinte consulta de pesquisa com base estritamente nos trechos de documentos fornecidos.

CONSULTA DO USUÁRIO:
${query}

TRECHOS DOS DOCUMENTOS:
${contextTexts.map((text, idx) => `--- Trecho ${idx + 1} ---\n${text}`).join('\n\n')}

RESUMO SINTÉTICO:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('[GEMINI:CLIENT] Erro ao chamar API Gemini para sumarização:', error);
      return `Resumo automático indisponível no momento. A busca retornou documentos relevantes para "${query}".`;
    }
  }

  /**
   * Executa o Chat RAG contextual aterrado (Grounding) com temperatura 0.2.
   */
  public async generateGroundedChatResponse(
    query: string,
    contextItems: GroundingContextItem[]
  ): Promise<string> {
    if (!this.genAI) {
      // Resposta simulada determinística para desenvolvimento/testes
      const citedDocs = contextItems.map((c) => c.documentTitle).filter(Boolean);
      const uniqueDocs = [...new Set(citedDocs)].join(', ');
      return `Com base nas informações dos documentos [${uniqueDocs}], os detalhes técnicos solicitados foram localizados nas seções correspondentes dos materiais da plataforma.`;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.2, // Máxima fidelidade e aterramento
          topP: 0.8
        }
      });

      const formattedContext = contextItems
        .map(
          (item) =>
            `[Doc: ${item.documentTitle}${item.sectionTitle ? ` - Seção: ${item.sectionTitle}` : ''}]\n${item.content}`
        )
        .join('\n\n');

      const groundingPrompt = `Você é o assistente técnico da plataforma Docs-Wiki. Responda à pergunta do usuário utilizando EXCLUSIVAMENTE os trechos de documentos fornecidos abaixo. Se não souber, diga que a informação não consta nos materiais. Sempre cite o documento de origem.

CONTEXTO:
${formattedContext}

PERGUNTA DO USUÁRIO:
${query}`;

      const result = await model.generateContent(groundingPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('[GEMINI:CLIENT] Erro ao chamar API Gemini para Chat RAG:', error);
      throw new Error('Falha na comunicação com o serviço de IA generativa Gemini.');
    }
  }
}

export const geminiClient = new GeminiClient();
