FROM node:10-slim

EXPOSE 80

# Create app directory
WORKDIR /usr/src/app

# Copy source code
COPY ./node_modules ./node_modules
COPY ./package.json ./
COPY ./dist ./


ENTRYPOINT [ "node", "./src/main.js" ]
