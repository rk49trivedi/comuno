// android-client-example.js - Production example for Android developers
const { io } = require("socket.io-client");

// This simulates how Android app should connect
// In real Android app, this would come from user input or device phone number

// Generate a random test phone number to simulate Android user
function generateTestUserPhoneNumber() {
    const countryCode = '+91';
    const number = Math.floor(Math.random() * 9000000000) + 1000000000; // 10 digit number
    return countryCode + number;
}

const userPhoneNumber = generateTestUserPhoneNumber();

console.log("📱 Simulating Android app connection...");
console.log(`📞 Simulated User Phone Number: ${userPhoneNumber}`);
console.log("💡 In real Android app, this would be the actual user's phone number");

// Connect to your production server
const socket = io("http://31.97.206.244:3000");

socket.on("connect", () => {
    console.log("✅ Connected to socket server");
    
    // Register with user's phone number (this is what Android app should do)
    const agentConfig = {
        agentId: `android-${userPhoneNumber.replace(/[^0-9]/g, '')}`,
        agentNumber: userPhoneNumber,  // User's actual phone number
        agentName: `Android User ${userPhoneNumber}`,
        agentType: "mobile_client"
    };
    
    console.log(`📞 Registering with phone number: ${userPhoneNumber}`);
    socket.emit('registerAgent', agentConfig);
});

// Handle registration responses
socket.on("registrationSuccess", (data) => {
    console.log("🎉 Registration successful!");
    console.log("📋 Connected agents:", data.connectedAgents);
    console.log("📞 Connected phone numbers:", data.connectedNumbers);
    console.log("\n✅ Android app is now ready to receive call data!");
    console.log(`📡 This phone number (${userPhoneNumber}) can now receive:`);
    console.log(`   - Incoming call notifications`);
    console.log(`   - Outgoing call notifications`);
    console.log(`   - Call recording notifications`);
});

socket.on("registrationError", (data) => {
    console.error("❌ Registration failed:", data.message);
});

// Handle agent connection/disconnection events
socket.on("agentConnected", (data) => {
    console.log("🔗 New agent connected:", data);
});

socket.on("agentDisconnected", (data) => {
    console.log("🔌 Agent disconnected:", data.agentId, data.agentNumber);
});

// Handle call events (this is what Android app should implement)
socket.on("incomingCall", (data) => {
    console.log("📞 INCOMING CALL received:", data);
    // Android app should show notification or update UI here
});

socket.on("outgoingCall", (data) => {
    console.log("📞 OUTGOING CALL received:", data);
    // Android app should show notification or update UI here
});

socket.on("callRecording", (data) => {
    console.log("🎵 CALL RECORDING received:", data);
    // Android app should handle recording data here
});

socket.on("disconnect", () => {
    console.log("🔌 Disconnected from socket server");
});

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Disconnecting...');
    socket.disconnect();
    process.exit(0);
});

console.log(`📱 Android client simulation running for ${userPhoneNumber}`);
console.log('Press Ctrl+C to disconnect');
console.log('\n📋 To test this simulated Android client:');
console.log('   1. Run: node test-api-production.js (will automatically test this client)');
console.log('   2. Or send directly:');
console.log(`      curl -X POST http://31.97.206.244:3000/api/incomingCall/number/${userPhoneNumber} \\`);
console.log(`        -H "Content-Type: application/json" \\`);
console.log(`        -d '{"callId": "123", "from": "+911234567890", "timestamp": "${new Date().toISOString()}"}'`);
console.log('\n🔄 This client will automatically reconnect if disconnected');
console.log('💡 In production, Android app would handle notifications in the UI');
