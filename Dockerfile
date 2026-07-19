FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
RUN npx prisma generate

EXPOSE 3000
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
