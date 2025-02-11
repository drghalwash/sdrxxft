FROM node:16-alpine  # Use a Node.js base image

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# If you have a build step (e.g., for a frontend framework)
RUN npm run build

EXPOSE 500  # Replace with the actual port your app uses

CMD ["npm", "start"]  # Or "node server.js" if you start directly

