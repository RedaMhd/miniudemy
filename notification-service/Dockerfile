FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json files
COPY package.json ./
COPY notification-service/package.json ./notification-service/
COPY shared/package.json ./shared/

# Install dependencies for workspaces
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY notification-service/ ./notification-service/

WORKDIR /usr/src/app/notification-service

EXPOSE 5004

CMD ["npm", "start"]
