# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar ferramentas de build para pacotes nativos
RUN apk add --no-cache python3 make g++

# Copiar arquivos de configuração do monorepo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/content/package.json ./services/content/

# Instalar todas as dependências do monorepo
RUN npm ci

# Copiar código-fonte de contratos compartilhados e do serviço Content
COPY packages/shared ./packages/shared
COPY services/content ./services/content

# Compilar TypeScript
RUN npm run build --workspace=@shared/contracts
RUN npm run build --workspace=content-service

# ==========================================
# STAGE 2: RUNNER (PRODUÇÃO)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests e instalar apenas dependências de produção
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/content/package.json ./services/content/

RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/services/content/dist ./services/content/dist

USER nodejs

EXPOSE 3002

CMD ["node", "services/content/dist/server.js"]
