	FROM node:14

	# Create app directory
	WORKDIR /app

	# Install app dependencies
	RUN npm install websocket

	# Bundle app source
	COPY . .

	# Expose the WebSocket port
	EXPOSE 8002

	# Command to run the WebSocket server
	CMD ["node", "main.js"]
