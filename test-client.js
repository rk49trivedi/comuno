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

    // Extract phone numbers and live_event from the data
    let agentPhone = null;
    let customerPhone = null;
    let liveEvent = null;

    // Extract live_event from different possible locations
    if (data.live_event) {
        liveEvent = data.live_event;
    } else if (data.call_details && data.call_details.live_event) {
        liveEvent = data.call_details.live_event;
    }

    // Extract agent phone number
    if (data.agent_details && data.agent_details.agent_number) {
        agentPhone = data.agent_details.agent_number;
    } else if (data.agent_details && Array.isArray(data.agent_details) && data.agent_details.length > 0) {
        agentPhone = data.agent_details[0].agent_number;
    }

    // Extract customer phone number
    if (data.call_details && data.call_details.customer_number) {
        customerPhone = data.call_details.customer_number;
    } else if (data.customer_details && data.customer_details.customer_number) {
        customerPhone = data.customer_details.customer_number;
    } else if (data.from) {
        customerPhone = data.from;
    }

    const targetPhone = data.targetPhoneNumber || agentPhone || 'broadcast';

    console.log(`📞 Incoming call data received for ${targetPhone}:`);
    console.log(`   🏷️  Live Event: ${liveEvent}`);
    console.log(`   👤 Agent Phone: ${agentPhone}`);
    console.log(`   📱 Customer Phone: ${customerPhone}`);

    // Only store data if live_event is 'evt_completed_with_recording'
    if (liveEvent === 'evt_completed_with_recording') {
        console.log('✅ Storing data - Call completed with recording');

        // Insert data into MySQL with additional fields
        const query = 'INSERT INTO call_logs (type, target_phone, agent_phone, customer_phone, live_event, data) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [type, targetPhone, agentPhone, customerPhone, liveEvent, JSON.stringify(data)], (err, result) => {
            if (err) {
                console.error('Database Insert Error:', err.message);
                return;
            }

            console.log(`💾 Data stored - ID: ${result.insertId}`);
            console.log(`   📞 Agent: ${agentPhone}`);
            console.log(`   📱 Customer: ${customerPhone}`);
        });
    } else {
        console.log(`⏭️  Skipping storage - Live event: ${liveEvent} (waiting for evt_completed_with_recording)`);
    }
});

socket.on("outgoingCall", (data) => {
    const type = 'outgoingCall';

    // Extract phone numbers and live_event from the data
    let agentPhone = null;
    let customerPhone = null;
    let liveEvent = null;

    // Extract live_event from different possible locations
    if (data.live_event) {
        liveEvent = data.live_event;
    } else if (data.call_details && data.call_details.live_event) {
        liveEvent = data.call_details.live_event;
    }

    // Extract agent phone number
    if (data.agent_details && data.agent_details.agent_number) {
        agentPhone = data.agent_details.agent_number;
    } else if (data.agent_details && Array.isArray(data.agent_details) && data.agent_details.length > 0) {
        agentPhone = data.agent_details[0].agent_number;
    }

    // Extract customer phone number
    if (data.call_details && data.call_details.customer_number) {
        customerPhone = data.call_details.customer_number;
    } else if (data.customer_details && data.customer_details.customer_number) {
        customerPhone = data.customer_details.customer_number;
    } else if (data.from) {
        customerPhone = data.from;
    }

    const targetPhone = data.targetPhoneNumber || agentPhone || 'broadcast';

    console.log(`📞 Outgoing call data received for ${targetPhone}:`);
    console.log(`   🏷️  Live Event: ${liveEvent}`);
    console.log(`   👤 Agent Phone: ${agentPhone}`);
    console.log(`   📱 Customer Phone: ${customerPhone}`);

    // Only store data if live_event is 'evt_completed_with_recording'
    if (liveEvent === 'evt_completed_with_recording') {
        console.log('✅ Storing data - Call completed with recording');

        // Insert data into MySQL with additional fields
        const query = 'INSERT INTO call_logs (type, target_phone, agent_phone, customer_phone, live_event, data) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [type, targetPhone, agentPhone, customerPhone, liveEvent, JSON.stringify(data)], (err, result) => {
            if (err) {
                console.error('Database Insert Error:', err.message);
                return;
            }

            console.log(`💾 Data stored - ID: ${result.insertId}`);
            console.log(`   📞 Agent: ${agentPhone}`);
            console.log(`   📱 Customer: ${customerPhone}`);
        });
    } else {
        console.log(`⏭️  Skipping storage - Live event: ${liveEvent} (waiting for evt_completed_with_recording)`);
    }
});

socket.on("callRecording", (data) => {
    const type = 'callRecording';

    // Extract phone numbers and live_event from the data
    let agentPhone = null;
    let customerPhone = null;
    let liveEvent = null;

    // Extract live_event from different possible locations
    if (data.live_event) {
        liveEvent = data.live_event;
    } else if (data.call_details && data.call_details.live_event) {
        liveEvent = data.call_details.live_event;
    }

    // Extract agent phone number
    if (data.agent_details && data.agent_details.agent_number) {
        agentPhone = data.agent_details.agent_number;
    } else if (data.agent_details && Array.isArray(data.agent_details) && data.agent_details.length > 0) {
        agentPhone = data.agent_details[0].agent_number;
    }

    // Extract customer phone number
    if (data.call_details && data.call_details.customer_number) {
        customerPhone = data.call_details.customer_number;
    } else if (data.customer_details && data.customer_details.customer_number) {
        customerPhone = data.customer_details.customer_number;
    } else if (data.from) {
        customerPhone = data.from;
    }

    const targetPhone = data.targetPhoneNumber || agentPhone || 'broadcast';

    console.log(`🎵 Call recording data received for ${targetPhone}:`);
    console.log(`   🏷️  Live Event: ${liveEvent}`);
    console.log(`   👤 Agent Phone: ${agentPhone}`);
    console.log(`   📱 Customer Phone: ${customerPhone}`);

    // Only store data if live_event is 'evt_completed_with_recording'
    if (liveEvent === 'evt_completed_with_recording') {
        console.log('✅ Storing data - Call completed with recording');

        // Insert data into MySQL with additional fields
        const query = 'INSERT INTO call_logs (type, target_phone, agent_phone, customer_phone, live_event, data) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [type, targetPhone, agentPhone, customerPhone, liveEvent, JSON.stringify(data)], (err, result) => {
            if (err) {
                console.error('Database Insert Error:', err.message);
                return;
            }

            console.log(`💾 Data stored - ID: ${result.insertId}`);
            console.log(`   📞 Agent: ${agentPhone}`);
            console.log(`   📱 Customer: ${customerPhone}`);
        });
    } else {
        console.log(`⏭️  Skipping storage - Live event: ${liveEvent} (waiting for evt_completed_with_recording)`);
    }
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from socket server");
});