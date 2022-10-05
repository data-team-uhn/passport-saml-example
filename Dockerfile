FROM node:18-alpine

RUN mkdir /app
WORKDIR /app
COPY app.js .
COPY package.json .
RUN npm install

ENV LISTEN_HOST=0.0.0.0
ENTRYPOINT node app.js
