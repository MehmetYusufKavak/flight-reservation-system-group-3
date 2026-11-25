# SABLON: Backend Node.js/Express varsayildi.
# 1. kisi farkli bir dil kullaniyorsa (Python/Flask, Java vb.) bu dosya ona gore degisecek.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
