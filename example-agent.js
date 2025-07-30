// example-agent.js - Production-ready agent with dynamic phone number
const { io } = require("socket.io-client");

// Get phone number and agent type from command line arguments
const agentPhoneNumber = process.argv[2];
const agentType = process.argv[3] || 'call_processor';

if (!agentPhoneNumber) {
    console.error("❌ Phone number is required!");
    console.log("Usage: node example-agent.js +919876543210 [agent_type]");
    console.log("Example: node example-agent.js +919876543210 call_processor");
    console.log("Agent types: call_processor, notification_service, analytics_processor");
    process.exit(1);
}

// Validate phone number format (basic validation)
if (!agentPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
    console.error("❌ Invalid phone number format! Use international format like +919876543210");
    process.exit(1);
}

// Dynamic agent configuration
const agentConfig = {
    agentId: `${agentType}-${agentPhoneNumber.replace(/[^0-9]/g, '')}`,
    agentNumber: agentPhoneNumber,
    agentName: `${agentType.charAt(0).toUpperCase() + agentType.slice(1)} - ${agentPhoneNumber}`,
    agentType: agentType
};

console.log(`🚀 Starting ${agentConfig.agentName}...`);
console.log(`📞 Phone Number: ${agentConfig.agentNumber}`);
console.log(`🏷️  Agent Type: ${agentConfig.agentType}`);

const socket = io("http://31.97.206.244:3000");

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
    console.log("🔌 Agent disconnected:", data.agentId);
});

// Handle call events based on agent type
socket.on("incomingCall", (data) => {
    console.log(`📞 [${agentConfig.agentName}] Incoming call received:`, data);
    
    // Different agents can handle the same event differently
    switch (agentConfig.agentType) {
        case 'call_processor':
            console.log("💾 Processing call for database storage...");
            break;
        case 'notification_service':
            console.log("🔔 Sending notification for incoming call...");
            break;
        case 'analytics_processor':
            console.log("📊 Analyzing incoming call patterns...");
            break;
    }
});

socket.on("outgoingCall", (data) => {
    console.log(`📞 [${agentConfig.agentName}] Outgoing call received:`, data);
    
    switch (agentConfig.agentType) {
        case 'call_processor':
            console.log("💾 Processing outgoing call for database storage...");
            break;
        case 'notification_service':
            console.log("🔔 Sending notification for outgoing call...");
            break;
        case 'analytics_processor':
            console.log("📊 Analyzing outgoing call patterns...");
            break;
    }
});

socket.on("callRecording", (data) => {
    console.log(`📞 [${agentConfig.agentName}] Call recording received:`, data);
    
    switch (agentConfig.agentType) {
        case 'call_processor':
            console.log("💾 Processing call recording for storage...");
            break;
        case 'notification_service':
            console.log("🔔 Sending notification for call recording...");
            break;
        case 'analytics_processor':
            console.log("📊 Analyzing call recording data...");
            break;
    }
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from socket server");
});

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down agent...');
    socket.disconnect();
    process.exit(0);
});

console.log(`📡 Agent ${agentConfig.agentId} is ready to receive events`);
console.log('Press Ctrl+C to stop the agent');
