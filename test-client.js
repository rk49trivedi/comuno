// test-client.js
const { io } = require("socket.io-client");
const db = require('./db');

const socket = io("http://31.97.206.244:3000");

// Agent configuration - Dynamic phone number from environment or command line
const agentPhoneNumber = process.env.AGENT_PHONE_NUMBER || process.argv[2];

if (!agentPhoneNumber) {
    console.error("❌ Phone number is required!");
    console.log("Usage: node test-client.js +919876543210");
    console.log("Or set environment variable: AGENT_PHONE_NUMBER=+919876543210");
    process.exit(1);
}

const agentConfig = {
    agentId: `call-logger-${agentPhoneNumber.replace(/[^0-9]/g, '')}`, // Dynamic agent ID
    agentNumber: agentPhoneNumber, // Dynamic phone number
    agentName: `Call Logger - ${agentPhoneNumber}`,
    agentType: "call_processor"
};

socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    console.log(`📞 Registering agent with phone number: ${agentConfig.agentNumber}`);

    // Register this client as an agent
    socket.emit('registerAgent', agentConfig);
});

// Handle registration responses
socket.on("registrationSuccess", (data) => {
    console.log("🎉 Agent registration successful:", data);
    console.log("📋 Connected agents:", data.connectedAgents);
    console.log("📞 Connected phone numbers:", data.connectedNumbers);
});

socket.on("registrationError", (data) => {
    console.error("❌ Agent registration failed:", data.message);
});

// Handle agent connection/disconnection events
socket.on("agentConnected", (data) => {
    console.log("🔗 New agent connected:", data);
});

socket.on("agentDisconnected", (data) => {
    console.log("🔌 Agent disconnected:", data.agentId, data.agentNumber);
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
    console.log("🔌 Disconnected from socket server");
});