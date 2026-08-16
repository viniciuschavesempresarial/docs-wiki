# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar ferramentas de build para pacotes nativos (se aplicável)
RUN apk update && apk add --no-cache python3 make g++

# Copiar arquivos de configuração do monorepo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/nlp/package.json ./services/nlp/

# Instalar todas as dependências do monorepo
RUN npm ci

# Copiar código-fonte de contratos compartilhados e do serviço NLP
COPY packages/shared ./packages/shared
COPY services/nlp ./services/nlp

# Compilar TypeScript
RUN npm run build --workspace=@shared/contracts
RUN npm run build --workspace=nlp-service

# ==========================================
# STAGE 2: RUNNER (PRODUÇÃO)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Instalar bibliotecas de suporte a runtime nativo se necessário
RUN apk add --no-cache libstdc++

# Copiar manifests e instalar apenas dependências de produção
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/nlp/package.json ./services/nlp/

RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/services/nlp/dist ./services/nlp/dist

USER nodejs

CMD ["node", "services/nlp/dist/worker.js"]
