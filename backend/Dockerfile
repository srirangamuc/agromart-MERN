FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application files
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the application with nodemon
CMD ["nodemon", "server.js"]
