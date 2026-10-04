FROM oven/bun:1 AS build
WORKDIR /site/app
COPY app/package.json app/bun.lock ./
COPY app/packages ./packages
RUN bun install --frozen-lockfile
COPY app/ ./
ARG VITE_SITE_ORIGIN
ENV VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN
RUN bun run build

FROM node:24-alpine
WORKDIR /site/app
ENV NODE_ENV=production PORT=8080
COPY --from=build /site/app/dist ./dist
COPY app/serve.mjs ./serve.mjs
COPY app/package.json ./package.json
USER node
EXPOSE 8080
CMD ["node", "serve.mjs"]
