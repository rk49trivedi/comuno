// android-client-example.js - Production example for Android developers
const { io } = require("socket.io-client");

// This simulates how Android app should connect
// Android developer should replace this with actual user's phone number from their app

// Get phone number from command line (Android app will get this from user input)
const userPhoneNumber = process.argv[2];

if (!userPhoneNumber) {
    console.error("❌ User phone number is required!");
    console.log("Usage: node android-client-example.js +919876543210");
    console.log("This simulates Android app connecting with user's phone number");
    process.exit(1);
}

// Validate phone number format
if (!userPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
    console.error("❌ Invalid phone number format! Use international format like +919876543210");
    process.exit(1);
}

console.log("📱 Simulating Android app connection...");
console.log(`📞 User Phone Number: ${userPhoneNumber}`);

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
console.log('\n📋 To test, send data to this phone number using:');
console.log(`curl -X POST http://31.97.206.244:3000/api/incomingCall/number/${userPhoneNumber} \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"callId": "123", "from": "+911234567890", "timestamp": "${new Date().toISOString()}"}'`);
