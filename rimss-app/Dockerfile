# Build context is the repository root: docker build -f rimss-app/Dockerfile .
# The API is reverse-proxied under /api, so the bundle uses a same-origin base URL.
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY rimss-api/package.json rimss-api/
COPY rimss-app/package.json rimss-app/
COPY deliverables/gen/package.json deliverables/gen/
RUN npm ci --ignore-scripts
COPY packages/shared packages/shared
COPY rimss-app rimss-app
ENV VITE_API_BASE_URL=/api
RUN npm run build -w @rimss/shared && npm run build -w rimss-app

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY rimss-app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/rimss-app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ || exit 1
