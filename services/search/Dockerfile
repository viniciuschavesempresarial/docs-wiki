# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração do monorepo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/search/package.json ./services/search/

# Instalar todas as dependências do monorepo usando cache
RUN npm ci

# Copiar código-fonte
COPY packages/shared ./packages/shared
COPY services/search ./services/search

# Compilar TypeScript
RUN npm run build --workspace=@shared/contracts
RUN npm run build --workspace=search-service

# ==========================================
# STAGE 2: RUNNER (PRODUÇÃO)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004

# Criação de usuário e grupo não-root
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests e instalar apenas dependências de produção
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/search/package.json ./services/search/

RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/services/search/dist ./services/search/dist

USER nodejs

EXPOSE 3004

CMD ["node", "services/search/dist/server.js"]
