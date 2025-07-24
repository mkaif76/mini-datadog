# ./frontend/Dockerfile

# Stage 1: Build the React application
FROM node:20.16-alpine3.19 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This creates the production build in the /app/dist directory
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy our custom nginx.conf to the Nginx configuration directory.
# This must be done BEFORE copying the web content.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application from the builder stage into NGINX's default web root.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]