FROM node:18.14 as builder

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install
COPY client client
COPY server server
COPY tsconfig.base.json tsconfig.base.json
RUN npm run build && npm run build-server-js

FROM node:18.14 as prod-deps

WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:18.14-slim

RUN apt-get update -y && apt-get install -y dumb-init

WORKDIR /app
COPY --from=prod-deps /build/node_modules node_modules
COPY --from=builder /build/client/dist client/dist
COPY --from=builder /build/server/dist server/dist
COPY server/src/db/migrations/ server/src/db/migrations/
COPY .sequelizerc .sequelizerc

VOLUME ["/db"]
EXPOSE 3000
ENV NODE_ENV=production \
    TZ=America/Bogota

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/dist/index.js"]
