FROM node:20-alpine
WORKDIR /app

RUN mkdir -p /app/uploads

COPY package.json ./
COPY node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

RUN mkdir -p dist/db/migrations
COPY src/db/migrations ./dist/db/migrations

EXPOSE ${PORT}
CMD ["node", "dist/server.js"]
