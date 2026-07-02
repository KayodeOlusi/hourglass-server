FROM node:22-slim AS base
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock* ./
COPY src/db/prisma ./src/db/prisma

FROM base AS development
ENV NODE_ENV=development
RUN yarn install
COPY . .
EXPOSE 4000
CMD ["yarn", "dev"]

FROM base AS build
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:22-slim AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock* ./
COPY src/db/prisma ./src/db/prisma

RUN yarn install --frozen-lockfile --production --ignore-scripts

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 4000
USER node
CMD [ "node", "dist/index.js" ]