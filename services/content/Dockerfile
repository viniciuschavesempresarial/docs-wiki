# ==========================================
# RUNNER: CONTENT SERVICE (PRODUÇÃO)
# ==========================================
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests do monorepo para resolução exata do package-lock
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/
COPY services/content/package.json ./services/content/
COPY services/nlp/package.json ./services/nlp/
COPY services/search/package.json ./services/search/
COPY frontend/package.json ./frontend/

# Instalar estritamente dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos pré-compilados pelo pipeline
COPY --chown=nodejs:nodejs packages/shared/dist ./packages/shared/dist
COPY --chown=nodejs:nodejs services/content/dist ./services/content/dist

USER nodejs

EXPOSE 3002

CMD ["node", "services/content/dist/server.js"]
