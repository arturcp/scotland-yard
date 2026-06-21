FROM node:24-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/board ./src/board
COPY src/lib/available-squares.ts ./src/lib/available-squares.ts
COPY src/types ./src/types
COPY tsconfig.json ./

EXPOSE 8080

CMD ["yarn", "start:prod"]
