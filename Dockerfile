FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

RUN wget -O server.js https://raw.githubusercontent.com/bxbzzbbbm-cmyk/sturdy-octo-happiness/refs/heads/main/server.js

RUN npm install express cors

ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
