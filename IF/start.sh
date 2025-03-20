#!/bin/bash
# filepath: /home/qhh/jobs/IF/start.sh

echo "===== Finance Ministry Portal Startup Script ====="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Ensure directories exist
echo "Ensuring upload directories exist..."
node -e "require('./server/utils/ensureDirectories')()"

# Check if database exists, initialize if needed
if [ ! -f "./database.sqlite" ]; then
    echo "Database not found. Initializing database..."
    node server/config/db-init.js
fi

# Start the server first
echo "Starting server on port 6000..."
NODE_ENV=development node server/server.js &
SERVER_PID=$!

# Wait for server to start (max 10 seconds)
echo "Waiting for server to start..."
COUNTER=0
while ! check_port 6000 && [ $COUNTER -lt 10 ]; do
    sleep 1
    let COUNTER=COUNTER+1
    echo "Waiting... ($COUNTER/10)"
done

if check_port 6000; then
    echo "Server is running on port 6000."
    
    # Start the client
    echo "Starting client on port 4000..."
    cd client && PORT=4000 npm start &
    CLIENT_PID=$!
    
    # Setup trap to kill both processes on exit
    trap "echo 'Stopping server and client...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null" EXIT
    
    # Wait for client to finish (it will run in the foreground)
    wait $CLIENT_PID
else
    echo "ERROR: Server failed to start on port 6000!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi