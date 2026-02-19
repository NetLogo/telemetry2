FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json      ./
COPY package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:24-alpine AS runner

ARG GIT_COMMIT
ENV APP_VERSION=$GIT_COMMIT
LABEL org.opencontainers.image.revision=$GIT_COMMIT
LABEL org.opencontainers.image.description="Image for the NetLogo desktop app's telemetry data storage server"
LABEL org.opencontainers.image.source="https://github.com/NetLogo/telemetry2"

WORKDIR /app

COPY package.json      ./
COPY package-lock.json ./

RUN npm ci --omit=dev --omit=optional

COPY --from=builder /app/dist/      ./dist/
COPY --from=builder /app/src/proto/ ./src/proto/

EXPOSE 3030

CMD ["node", "dist/src/controller.js"]
