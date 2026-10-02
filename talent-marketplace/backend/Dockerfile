FROM node:20-alpine

WORKDIR /app

# Install production dependencies only — devDependencies (jest, nodemon,
# supertest, cross-env) have no place in the shipped image.
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application code (node_modules, .env, logs, and __tests__ are
# excluded by .dockerignore)
COPY . .

# Run as the non-root user the base image already provides instead of root.
RUN chown -R node:node /app
USER node

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
