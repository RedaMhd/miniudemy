FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json files
COPY package.json ./
COPY auth-service/package.json ./auth-service/
COPY shared/package.json ./shared/

# Install dependencies for workspaces
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY auth-service/ ./auth-service/

WORKDIR /usr/src/app/auth-service

EXPOSE 5001

CMD ["npm", "start"]
