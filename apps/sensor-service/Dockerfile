# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14

FROM node:${NODE_VERSION}-alpine AS base
USER node
WORKDIR /usr/src/app

COPY --chown==node:node ./package*.json /usr/src/app/

COPY --chown==node:node ./libs /usr/src/app/libs/


FROM base AS dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --include=dev
COPY --chown==node:node ./apps/sensor-service /usr/src/app/apps/sensor-service
COPY --chown==node:node ./tsconfig.json /usr/src/app
COPY --chown==node:node ./tsconfig.build.json /usr/src/app
COPY --chown==node:node ./nest-cli.json /usr/src/app
CMD npm start sensor-service --watch

FROM base AS prod
RUN --mount=type=bind,source=../../package.json,target=package.json \
    --mount=type=bind,source=../../package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
USER node
COPY . .
CMD node src/index.js