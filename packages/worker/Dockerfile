FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# 🛠️ Compile TypeScript to JavaScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
