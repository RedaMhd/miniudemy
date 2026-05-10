FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json files
COPY package.json ./
COPY course-service/package.json ./course-service/
COPY shared/package.json ./shared/

# Install dependencies for workspaces
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY course-service/ ./course-service/

WORKDIR /usr/src/app/course-service

EXPOSE 5002

CMD ["npm", "start"]
