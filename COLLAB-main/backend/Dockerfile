# Frontend Dockerfile
FROM node:18-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Copy frontend build to backend static (optional, or serve via nginx)
# Here we keep them separate services for simplicity in compose

EXPOSE 3001
CMD ["node", "server.js"]
