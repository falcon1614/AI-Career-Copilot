FROM node:20-alpine
WORKDIR /app

COPY package.json ./
COPY node_modules ./node_modules
COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

EXPOSE ${PORT}
CMD ["node", "dist/server.js"]
