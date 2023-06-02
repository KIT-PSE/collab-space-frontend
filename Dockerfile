FROM node:18

LABEL maintainer="Florian Raith"

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm install

COPY . .