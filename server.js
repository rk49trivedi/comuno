// // server.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);  // Create Socket.IO server

// const port = 3000;

// // Middleware to parse JSON request bodies
// app.use(bodyParser.json());

// // Store socket connection
// let connectedSocket = null;

// // Handle socket connection
// io.on('connection', (socket) => {
//     console.log('📡 Client connected via socket');

//     // Save reference to socket
//     connectedSocket = socket;

//     socket.on('disconnect', () => {
//         console.log('❌ Client disconnected');
//         connectedSocket = null;
//     });
// });

// // POST route for incomingCall, outgoingCall, callRecording
// app.post('/api/:type', (req, res) => {
//     const { type } = req.params;
//     const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

//     if (!validTypes.includes(type)) {
//         return res.status(400).json({ status: 'error', message: 'Invalid event type' });
//     }

//     const data = req.body;

//     // Emit data through socket instead of saving in DB
//     if (connectedSocket) {
//         connectedSocket.emit(type, data);  // Send event named 'incomingCall', 'outgoingCall', etc.
//         res.json({ status: 'success', message: `${type} event sent via socket` });
//     } else {
//         res.status(503).json({ status: 'error', message: 'No socket client connected' });
//     }
// });

// // Start server
// server.listen(port, () => {
//     console.log(`🚀 Server running at http://localhost:${port}`);
// });
