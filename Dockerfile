FROM node:20

LABEL maintainer="Florian Raith"

ENV NODE_ENV=development

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5173