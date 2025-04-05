# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14

FROM node:${NODE_VERSION}-alpine AS base
USER node
WORKDIR /usr/src/app

COPY --chown==node:node ./package*.json /usr/src/app/

COPY --chown==node:node ./libs /usr/src/app/libs/


FROM base AS dev
EXPOSE 3000
RUN --mount=type=bind,source=./package.json,target=/usr/src/app/package.json \
    --mount=type=bind,source=./package-lock.json,target=/usr/src/app/package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
COPY --chown==node:node ./tsconfig.json ./nest-cli.json ./tsconfig.build.json /usr/src/app/
COPY --chown==node:node ./apps/smart-farming-api-gateway /usr/src/app/apps/smart-farming-api-gateway

COPY --chown==node:node ./assets /usr/src/app/assets
CMD npm start smart-farming-api-gateway --watch

FROM base AS prod
RUN --mount=type=bind,source=../../package.json,target=package.json \
    --mount=type=bind,source=../../package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY . .
CMD node src/index.js