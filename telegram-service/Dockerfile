FROM node:24-alpine
WORKDIR /service
COPY config.mjs telegram.mjs app.mjs server.mjs ./
ENV HOST=0.0.0.0 PORT=8787
USER node
EXPOSE 8787
CMD ["node", "server.mjs"]
