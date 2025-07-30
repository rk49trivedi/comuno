// example-agent.js - Production-ready test agent
const { io } = require("socket.io-client");

// Generate a random test phone number for this agent instance
function generateTestPhoneNumber() {
    const countryCode = '+91';
    const number = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 digit number
    return countryCode + number;
}

// Get agent type from command line or use default
const agentType = process.argv[2] || 'test_agent';
const agentPhoneNumber = generateTestPhoneNumber();

console.log('🤖 Starting Example Test Agent...');
console.log(`📞 Generated phone number: ${agentPhoneNumber}`);
console.log(`🏷️  Agent type: ${agentType}`);

// Dynamic agent configuration
const agentConfig = {
    agentId: `${agentType}-${Date.now()}`,
    agentNumber: agentPhoneNumber,
    agentName: `Test ${agentType.charAt(0).toUpperCase() + agentType.slice(1)} Agent`,
    agentType: agentType
};

console.log(`🚀 Starting ${agentConfig.agentName}...`);

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
console.log(`📞 This agent can receive notifications at: ${agentConfig.agentNumber}`);
console.log('Press Ctrl+C to stop the agent');
console.log('\n💡 To test this agent, run:');
console.log(`   node test-api-production.js`);
console.log(`   Or send directly: curl -X POST http://31.97.206.244:3000/api/incomingCall/number/${agentConfig.agentNumber} -H "Content-Type: application/json" -d '{"test": true}'`);
