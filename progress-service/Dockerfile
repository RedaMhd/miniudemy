FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json files
COPY package.json ./
COPY progress-service/package.json ./progress-service/
COPY shared/package.json ./shared/

# Install dependencies for workspaces
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY progress-service/ ./progress-service/

WORKDIR /usr/src/app/progress-service

EXPOSE 5003

CMD ["npm", "start"]
