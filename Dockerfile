FROM node:20-alpine

LABEL maintainer="tannousgeagea@hotmail.com"
LABEL com.perceptra.version="1.1b1"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# RUN npm run build

CMD ["npm", "run", "dev"]
