	FROM node:14

	# Create app directory
	WORKDIR /app

	# Copy package.json and package-lock.json
	COPY package*.json ./

	# Install app dependencies
	RUN npm install

	# Bundle app source
	COPY . .

	# Expose the WebSocket port
	EXPOSE 8080

	# Command to run the WebSocket server
	CMD ["node", "main.js"]
