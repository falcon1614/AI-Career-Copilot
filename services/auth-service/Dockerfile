FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

# Copy SQL migration files into dist (tsc doesn't copy non-ts files)
RUN mkdir -p dist/db/migrations
COPY src/db/migrations ./dist/db/migrations

EXPOSE ${PORT}
CMD ["node", "dist/server.js"]
