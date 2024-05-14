FROM node:latest
WORKDIR /home/node/app

RUN npm install -g typescript

COPY . .

RUN ls .

RUN npm run build

RUN npm ci 

ENTRYPOINT ["npm", "start"]