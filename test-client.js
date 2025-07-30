// test-client.js
const { io } = require("socket.io-client");
const db = require('./db');

const socket = io("http://31.97.206.244:3000");

// Production configuration - This is a database service that processes ALL call data
// It doesn't need a specific phone number - it handles data for all agents
const agentConfig = {
    agentId: `database-service-${Date.now()}`, // Unique service ID
    agentNumber: "DATABASE_SERVICE", // Special identifier for database service
    agentName: "Database Call Logger Service",
    agentType: "database_service"
};

socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    console.log(`🗄️  Registering as database service: ${agentConfig.agentName}`);

    // Register this client as a database service
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
    const type = 'incomingCall';
    const targetPhone = data.targetPhoneNumber || 'broadcast';

    console.log(`📞 Incoming call data received for ${targetPhone}:`, data);

    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, target_phone, data) VALUES (?, ?, ?)';
    db.query(query, [type, targetPhone, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return;
        }

        console.log(`💾 Data stored for ${targetPhone} - ID: ${result.insertId}`);
    });
});

socket.on("outgoingCall", (data) => {
    const type = 'outgoingCall';
    const targetPhone = data.targetPhoneNumber || 'broadcast';

    console.log(`📞 Outgoing call data received for ${targetPhone}:`, data);

    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, target_phone, data) VALUES (?, ?, ?)';
    db.query(query, [type, targetPhone, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return;
        }

        console.log(`💾 Data stored for ${targetPhone} - ID: ${result.insertId}`);
    });
});

socket.on("callRecording", (data) => {
    const type = 'callRecording';
    const targetPhone = data.targetPhoneNumber || 'broadcast';

    console.log(`🎵 Call recording data received for ${targetPhone}:`, data);

    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, target_phone, data) VALUES (?, ?, ?)';
    db.query(query, [type, targetPhone, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return;
        }

        console.log(`💾 Data stored for ${targetPhone} - ID: ${result.insertId}`);
    });
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from socket server");
});