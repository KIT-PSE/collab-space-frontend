FROM node:20 as base

LABEL maintainer="Florian Raith"

WORKDIR /usr/src/app/frontend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base as development

ENV NODE_ENV=development

EXPOSE 5173

CMD ["npm", "run", "dev"]

FROM nginx:stable-alpine as production

ENV NODE_ENV=production

COPY --from=base /usr/src/app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]