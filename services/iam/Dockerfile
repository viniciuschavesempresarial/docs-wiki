# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de configuração do monorepo
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/

# Instalar todas as dependências do monorepo
RUN npm ci

# Copiar código-fonte de contratos compartilhados e do serviço IAM
COPY packages/shared ./packages/shared
COPY services/iam ./services/iam

# Compilar TypeScript
RUN npm run build --workspace=@shared/contracts
RUN npm run build --workspace=@docswiki/iam-service

# ==========================================
# STAGE 2: RUNNER (PRODUÇÃO)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Criação de usuário e grupo não-root para segurança
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs

# Copiar manifests e instalar apenas dependências de produção
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/iam/package.json ./services/iam/

RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefatos compilados
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/services/iam/dist ./services/iam/dist

USER nodejs

EXPOSE 3001

CMD ["node", "services/iam/dist/server.js"]
