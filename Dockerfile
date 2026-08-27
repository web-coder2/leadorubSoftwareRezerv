FROM node:20-slim

WORKDIR /app

COPY client/dist ./client/dist
COPY server/ ./server
COPY package.json package.json

RUN npm install

EXPOSE 4000
EXPOSE 8000

CMD ["npm", "start"]