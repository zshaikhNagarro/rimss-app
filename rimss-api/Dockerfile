# Build context is the repository root: docker build -f rimss-api/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY rimss-api/package.json rimss-api/
COPY rimss-app/package.json rimss-app/
COPY deliverables/gen/package.json deliverables/gen/
RUN npm ci --ignore-scripts
COPY packages/shared packages/shared
COPY rimss-api rimss-api
RUN npm run build -w @rimss/shared -w @rimss/api

FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY rimss-api/package.json rimss-api/
COPY rimss-app/package.json rimss-app/
COPY deliverables/gen/package.json deliverables/gen/
RUN npm ci --omit=dev --ignore-scripts -w @rimss/api -w @rimss/shared

FROM node:22-alpine
ENV NODE_ENV=production PORT=4000
WORKDIR /repo
COPY --from=deps /repo/node_modules node_modules
COPY --from=build /repo/packages/shared/package.json packages/shared/package.json
COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/rimss-api/package.json rimss-api/package.json
COPY --from=build /repo/rimss-api/dist rimss-api/dist
COPY rimss-api/migrations rimss-api/migrations
COPY rimss-api/data/products.json rimss-api/data/products.json
# Non-root; the data dir is writable for the dev-only JSON fallbacks.
RUN chown -R node:node /repo/rimss-api/data
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "rimss-api/dist/server.js"]
