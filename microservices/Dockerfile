FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY microservices.js .

# Copy wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# waiting for kafka before running
CMD ["/wait-for-it.sh", "kafka:9092", "--", "node", "microservices.js"]
