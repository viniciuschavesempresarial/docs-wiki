import React from 'react';
import DOMPurify from 'dompurify';

export interface MarkdownPreviewProps {
  content: string;
}

// Simple and robust Markdown to HTML compiler with DOMPurify sanitization
export function renderMarkdownSafely(rawMarkdown: string): string {
  if (!rawMarkdown) return '<p class="text-slate-500 italic">Nenhum conteúdo para visualização...</p>';

  // Separate frontmatter if present
  let markdownBody = rawMarkdown;
  let frontmatterHtml = '';

  const frontmatterMatch = rawMarkdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    markdownBody = frontmatterMatch[2];
    frontmatterHtml = `
      <div class="mb-6 p-4 rounded-xl bg-slate-900/90 border border-brand-500/30 text-xs font-mono">
        <div class="text-brand-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>Metadata / YAML Frontmatter</span>
        </div>
        <pre class="text-slate-300 overflow-x-auto m-0 p-0 bg-transparent border-0">${DOMPurify.sanitize(yamlContent)}</pre>
      </div>
    `;
  }

  // Basic markdown transformation
  let html = markdownBody
    // Code blocks
    .replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_match, _lang, code) => {
      return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    })
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Unordered lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<ul><li>$1</li></ul>')
    // Ordered lists
    .replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs / line breaks
    .replace(/\n\s*\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />');

  // Fix consecutive list tags
  html = html.replace(/<\/ul>\s*<ul>/gim, '');
  html = html.replace(/<\/ol>\s*<ol>/gim, '');

  const completeHtml = frontmatterHtml + `<div class="markdown-body"><p>${html}</p></div>`;

  // XSS Sanitization with DOMPurify
  return DOMPurify.sanitize(completeHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'div', 'span', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'hr',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'data-testid'],
  });
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  const sanitizedHtml = renderMarkdownSafely(content);

  return (
    <div
      id="container-markdown-preview"
      data-testid="container-markdown-preview"
      className="w-full h-full p-6 overflow-y-auto bg-slate-950/40 rounded-xl border border-slate-800 text-slate-200"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
