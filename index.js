// index.js or server.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS enabled for Android apps (or any client)
const io = new Server(server, {
  cors: {
    origin: "*",     // For testing allow all origins; update to your app URL/domain in production
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Store all connected clients in a Set (support multiple Android clients)
const connectedSockets = new Set();

io.on('connection', (socket) => {
    console.log(`✅ WebSocket client connected: ${socket.id}`);
    connectedSockets.add(socket);

    socket.on('disconnect', () => {
        console.log(`❌ WebSocket client disconnected: ${socket.id}`);
        connectedSockets.delete(socket);
    });
});

// POST route for call events from your Android backend or any REST client
app.post('/api/:type', (req, res) => {
    const { type } = req.params;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    const data = req.body;

    if (connectedSockets.size > 0) {
        // Emit event to all connected clients
        connectedSockets.forEach(socket => {
            socket.emit(type, data);
        });
        return res.json({ status: 'success', message: `${type} event sent to ${connectedSockets.size} client(s)` });
    } else {
        return res.status(503).json({ status: 'error', message: 'No socket client connected' });
    }
});

// Start server
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
