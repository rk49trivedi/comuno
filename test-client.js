// test-client.js
const { io } = require("socket.io-client");
const db = require('./db');

const socket = io("http://31.97.206.244:3000");

socket.on("connect", () => {
    console.log("✅ Connected to socket server");
});

socket.on("incomingCall", (data) => {
    
    const  type  = 'incomingCall';
    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, data) VALUES (?, ?)';
    db.query(query, [type, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Database error'+ err.message
            });
        }

        
        console.log("Data stored");
        
    });
    
    console.log("📞 Incoming call data received:", data);
});

socket.on("outgoingCall", (data) => {
    
    const  type  = 'outgoingCall';
    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, data) VALUES (?, ?)';
    db.query(query, [type, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Database error'+ err.message
            });
        }

        
        console.log("Data stored");
        
    });
    
    console.log("📞  outgoingCall data received:", data);
});

socket.on("callRecording", (data) => {
    
    const  type  = 'callRecording';
    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, data) VALUES (?, ?)';
    db.query(query, [type, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Database error'+ err.message
            });
        }

        
        console.log("Data stored");
        
    });
    
    console.log("📞  callRecording data received:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
});








// const { io } = require("socket.io-client");

// const socket = io("http://31.97.206.244:3000");

// socket.on("connect", () => {
//     console.log("✅ Connected to socket server");
// });

// socket.on("incomingCall", (data) => {
//     console.log("📞 Incoming call data received:", data);
// });

// socket.on("disconnect", () => {
//     console.log("Disconnected from socket server");
// });
