FROM node:latest

WORKDIR /usr/src/app
COPY . .
RUN npm i express
RUN npm i cors

ENTRYPOINT [ "npm", "start" ]