// test-api-production.js - Production testing script for API endpoints
const axios = require('axios');

const SERVER_URL = 'http://31.97.206.244:3000';

// Get phone number from command line
const targetPhoneNumber = process.argv[2];

if (!targetPhoneNumber) {
    console.error("❌ Target phone number is required!");
    console.log("Usage: node test-api-production.js +919876543210");
    console.log("This will send test notifications to the specified phone number");
    process.exit(1);
}

// Validate phone number format
if (!targetPhoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
    console.error("❌ Invalid phone number format! Use international format like +919876543210");
    process.exit(1);
}

// Test data for different call types
const testData = {
    incomingCall: {
        callId: `call-${Date.now()}`,
        from: "+911234567890",
        to: targetPhoneNumber,
        timestamp: new Date().toISOString(),
        duration: 0,
        status: "ringing"
    },
    outgoingCall: {
        callId: `call-${Date.now() + 1}`,
        from: targetPhoneNumber,
        to: "+911234567890",
        timestamp: new Date().toISOString(),
        duration: 0,
        status: "dialing"
    },
    callRecording: {
        callId: `call-${Date.now()}`,
        recordingUrl: "https://example.com/recording.mp3",
        duration: 120,
        timestamp: new Date().toISOString()
    }
};

async function testAPI() {
    console.log(`🧪 Testing API endpoints for phone number: ${targetPhoneNumber}\n`);

    try {
        // Test 1: Check if target phone number is connected
        console.log(`1️⃣ Checking if ${targetPhoneNumber} is connected...`);
        try {
            const agentResponse = await axios.get(`${SERVER_URL}/api/agents/number/${targetPhoneNumber}`);
            console.log('✅ Agent is connected:', agentResponse.data.agent);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`⚠️  Agent ${targetPhoneNumber} is not connected`);
                console.log('Make sure the Android app or agent is running with this phone number');
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 2: List all connected agents
        console.log('2️⃣ Listing all connected agents...');
        const agentsResponse = await axios.get(`${SERVER_URL}/api/agents`);
        console.log('✅ Connected agents:', agentsResponse.data.agents.length);
        agentsResponse.data.agents.forEach(agent => {
            console.log(`   📞 ${agent.agentNumber} - ${agent.agentName}`);
        });
        console.log('');

        // Test 3: Send incoming call notification
        console.log(`3️⃣ Sending incoming call notification to ${targetPhoneNumber}...`);
        try {
            const incomingResponse = await axios.post(`${SERVER_URL}/api/incomingCall/number/${targetPhoneNumber}`, testData.incomingCall);
            console.log('✅ Incoming call sent:', incomingResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`❌ Failed: ${targetPhoneNumber} is not connected`);
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 4: Send outgoing call notification
        console.log(`4️⃣ Sending outgoing call notification to ${targetPhoneNumber}...`);
        try {
            const outgoingResponse = await axios.post(`${SERVER_URL}/api/outgoingCall/number/${targetPhoneNumber}`, testData.outgoingCall);
            console.log('✅ Outgoing call sent:', outgoingResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`❌ Failed: ${targetPhoneNumber} is not connected`);
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 5: Send call recording notification
        console.log(`5️⃣ Sending call recording notification to ${targetPhoneNumber}...`);
        try {
            const recordingResponse = await axios.post(`${SERVER_URL}/api/callRecording/number/${targetPhoneNumber}`, testData.callRecording);
            console.log('✅ Call recording sent:', recordingResponse.data);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`❌ Failed: ${targetPhoneNumber} is not connected`);
            } else {
                throw error;
            }
        }
        console.log('');

        // Test 6: Test multiple phone numbers (if other agents are connected)
        if (agentsResponse.data.agents.length > 1) {
            const connectedNumbers = agentsResponse.data.agents.map(agent => agent.agentNumber);
            console.log('6️⃣ Testing multiple phone numbers...');
            const multipleResponse = await axios.post(`${SERVER_URL}/api/incomingCall/numbers`, {
                agentNumbers: connectedNumbers,
                ...testData.incomingCall
            });
            console.log('✅ Multiple agents notification sent:', multipleResponse.data);
        }

        console.log('\n🎉 API testing completed!');
        console.log(`📱 If ${targetPhoneNumber} is connected, they should have received the notifications.`);

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run tests
if (require.main === module) {
    console.log('🚀 Starting production API tests...');
    console.log(`🎯 Target phone number: ${targetPhoneNumber}`);
    console.log('Make sure the target phone number is connected to receive notifications.\n');
    
    setTimeout(() => {
        testAPI();
    }, 1000);
}

module.exports = { testAPI, testData };
