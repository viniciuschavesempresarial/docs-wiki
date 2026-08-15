export interface RawChunk {
  chunk_index: number;
  titulo_secao: string;
  conteudo_chunk: string;
}

export interface SplitterOptions {
  minWordsPerChunk?: number;
  maxWordsPerChunk?: number;
  overlapWords?: number;
  defaultTitle?: string;
}

const DEFAULT_OPTIONS: Required<SplitterOptions> = {
  minWordsPerChunk: 50,
  maxWordsPerChunk: 400,
  overlapWords: 50,
  defaultTitle: 'Documento Principal'
};

/**
 * Divide um corpo de texto Markdown em seções estruturadas baseadas em cabeçalhos (#, ##, ###)
 * e aplica divisão com sobreposição contextual em seções longas (Parent-Document Retriever).
 */
export function splitMarkdownIntoChunks(
  markdownBody: string,
  options?: SplitterOptions
): RawChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines = markdownBody.split('\n');
  const sections: { title: string; content: string[] }[] = [];

  let currentTitle = opts.defaultTitle;
  let currentContent: string[] = [];

  const headerRegex = /^(#{1,3})\s+(.+)$/;

  for (const line of lines) {
    const headerMatch = line.match(headerRegex);

    if (headerMatch) {
      // Se já temos conteúdo acumulado, finaliza a seção anterior
      const joinedContent = currentContent.join('\n').trim();
      if (joinedContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: [...currentContent]
        });
      }

      currentTitle = headerMatch[2].trim();
      currentContent = [line];
    } else {
      currentContent.push(line);
    }
  }

  // Adiciona a última seção se houver conteúdo
  const finalJoined = currentContent.join('\n').trim();
  if (finalJoined.length > 0) {
    sections.push({
      title: currentTitle,
      content: [...currentContent]
    });
  }

  // Se o documento estiver vazio ou não tiver seções válidas
  if (sections.length === 0) {
    const trimmed = markdownBody.trim();
    if (!trimmed) {
      return [];
    }
    sections.push({
      title: opts.defaultTitle,
      content: [trimmed]
    });
  }

  const rawChunks: RawChunk[] = [];
  let chunkCounter = 0;

  for (const section of sections) {
    const sectionText = section.content.join('\n').trim();
    const words = sectionText.split(/\s+/).filter(Boolean);

    if (words.length <= opts.maxWordsPerChunk) {
      rawChunks.push({
        chunk_index: chunkCounter++,
        titulo_secao: section.title,
        conteudo_chunk: sectionText
      });
    } else {
      // Seção muito longa: divide em sub-chunks com sobreposição de palavras
      let startIdx = 0;
      let partCounter = 1;

      while (startIdx < words.length) {
        const endIdx = Math.min(startIdx + opts.maxWordsPerChunk, words.length);
        const chunkWords = words.slice(startIdx, endIdx);
        const subChunkText = chunkWords.join(' ').trim();

        const titleWithPart =
          partCounter === 1 && endIdx >= words.length
            ? section.title
            : `${section.title} (Parte ${partCounter})`;

        rawChunks.push({
          chunk_index: chunkCounter++,
          titulo_secao: titleWithPart,
          conteudo_chunk: subChunkText
        });

        if (endIdx >= words.length) {
          break;
        }

        // Avança mantendo sobreposição (overlap)
        startIdx += opts.maxWordsPerChunk - opts.overlapWords;
        partCounter++;
      }
    }
  }

  return rawChunks;
}
