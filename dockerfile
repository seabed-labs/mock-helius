FROM node:16.15.0-alpine AS base

WORKDIR /project

FROM base AS dependencies

RUN yarn global add typescript
COPY tsconfig.json .
COPY package.json .
COPY yarn.lock .
RUN yarn install --production --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache
COPY src/ src/
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]