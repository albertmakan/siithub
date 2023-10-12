FROM node:16-alpine AS build

WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:16-alpine

RUN apk update && apk add git openssh openrc
RUN mkdir /run/openrc && touch /run/openrc/softlevel

WORKDIR /app
COPY --from=build app/package.json ./
RUN npm i --only=production
COPY --from=build app/dist ./

COPY --from=build app/scripts ./
RUN git config --global init.templatedir '/app/.git-template'
RUN chmod +x ./startup.sh

EXPOSE 22

ENTRYPOINT [ "/app/startup.sh" ]
