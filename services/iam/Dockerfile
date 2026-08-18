# ==========================================
# RUNNER: IAM SERVICE (PRODUÇÃO)
# ==========================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests do monorepo para resolução exata das dependências
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/
COPY services/content/package.json ./services/content/
COPY services/nlp/package.json ./services/nlp/
COPY services/search/package.json ./services/search/
COPY frontend/package.json ./frontend/

# Instalar estritamente dependências de produção
RUN npm install --omit=dev --no-audit --loglevel=error

# Copiar artefatos pré-compilados pelo pipeline
COPY --chown=nodejs:nodejs packages/shared/dist ./packages/shared/dist
COPY --chown=nodejs:nodejs services/iam/dist ./services/iam/dist

USER nodejs

EXPOSE 3001

CMD ["node", "services/iam/dist/server.js"]
