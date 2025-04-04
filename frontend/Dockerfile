# frontend/Dockerfile

# Use an official node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
# Use --frozen-lockfile for reproducible installs in CI/CD, good practice
RUN npm install --frozen-lockfile

# Copy the rest of the application code to the working directory
COPY . .

# Export the port the app runs on (Vite default is 5173, CRA is 3000)
EXPOSE 5173

# Command to run the app (Vite uses 'dev')
CMD ["npm", "run", "dev", "--", "--host"] 
# --host allows access from outside the container