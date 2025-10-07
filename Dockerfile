FROM node:24 AS client-builder

WORKDIR /build
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client ./
RUN npm run build

FROM node:24 AS server-builder

WORKDIR /build
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server ./
RUN npm run build

FROM node:24 AS server-prod-deps

WORKDIR /build
COPY server/package.json server/package-lock.json ./
RUN npm ci --only=prod

## Server
FROM node:24-slim AS server

RUN apt-get update -y && \
    apt-get install -y dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=server-prod-deps /build/node_modules node_modules
COPY --from=client-builder /build/dist client/dist
COPY --from=server-builder /build/dist server/dist
COPY server/src/db/migrations/ server/src/db/migrations/
COPY server/.sequelizerc server/.sequelizerc

VOLUME ["/db"]
EXPOSE 3000
ENV NODE_ENV=production \
    TZ=America/Bogota

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/dist/index.js"]

## Client
FROM nginx:stable-alpine AS client

COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=client-builder /build/dist /app/public/
