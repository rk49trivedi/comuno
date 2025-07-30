// test-api-production.js - Production testing script for API endpoints
const axios = require('axios');

const SERVER_URL = 'http://31.97.206.244:3000';

// This script will test API endpoints by checking connected agents and testing with them
console.log('🧪 API Testing Service - Tests endpoints with currently connected agents');

// Generate test data for different call types
function generateTestData(targetPhoneNumber) {
    return {
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
}

async function testAPI() {
    console.log('🧪 Testing API endpoints with connected agents...\n');

    try {
        // Test 1: List all connected agents
        console.log('1️⃣ Listing all connected agents...');
        const agentsResponse = await axios.get(`${SERVER_URL}/api/agents`);
        console.log('✅ Connected agents:', agentsResponse.data.agents.length);

        if (agentsResponse.data.agents.length === 0) {
            console.log('⚠️  No agents connected! Start some agents first:');
            console.log('   node test-client.js (database service)');
            console.log('   node example-agent.js (test agent)');
            console.log('   node android-client-example.js (Android simulation)');
            return;
        }

        agentsResponse.data.agents.forEach(agent => {
            console.log(`   📞 ${agent.agentNumber} - ${agent.agentName} (${agent.agentType})`);
        });
        console.log('');

        // Get phone number agents (exclude database services)
        const phoneAgents = agentsResponse.data.agents.filter(agent =>
            agent.agentNumber !== 'DATABASE_SERVICE'
        );

        if (phoneAgents.length === 0) {
            console.log('⚠️  No phone number agents connected! Only database services found.');
            console.log('Start an agent with a phone number to test targeted notifications.');

            // Test broadcast only
            await testBroadcast(agentsResponse.data.agents);
            return;
        }

        // Test with first phone number agent
        const targetAgent = phoneAgents[0];
        const targetPhoneNumber = targetAgent.agentNumber;
        const testData = generateTestData(targetPhoneNumber);

        console.log(`🎯 Testing with agent: ${targetPhoneNumber} (${targetAgent.agentName})\n`);

        // Test 2: Send incoming call notification
        console.log(`2️⃣ Sending incoming call notification to ${targetPhoneNumber}...`);
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

        // Test 3: Send outgoing call notification
        console.log(`3️⃣ Sending outgoing call notification to ${targetPhoneNumber}...`);
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

        // Test 4: Send call recording notification
        console.log(`4️⃣ Sending call recording notification to ${targetPhoneNumber}...`);
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

        // Test 5: Test multiple phone numbers
        if (phoneAgents.length > 1) {
            const connectedNumbers = phoneAgents.map(agent => agent.agentNumber);
            console.log('5️⃣ Testing multiple phone numbers...');
            const multipleResponse = await axios.post(`${SERVER_URL}/api/incomingCall/numbers`, {
                agentNumbers: connectedNumbers,
                ...testData.incomingCall
            });
            console.log('✅ Multiple agents notification sent:', multipleResponse.data);
        }

        // Test 6: Test broadcast to all agents
        await testBroadcast(agentsResponse.data.agents);

        console.log('\n🎉 API testing completed!');
        console.log(`📱 Agents should have received the notifications.`);

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Test broadcast to all agents
async function testBroadcast(agents) {
    console.log('6️⃣ Testing broadcast to all agents...');

    try {
        const broadcastData = {
            callId: `broadcast-${Date.now()}`,
            from: "+911234567890",
            timestamp: new Date().toISOString(),
            message: "Test broadcast to all agents"
        };

        const broadcastResponse = await axios.post(`${SERVER_URL}/api/incomingCall`, broadcastData);
        console.log('✅ Broadcast sent to all agents:', broadcastResponse.data);
        console.log(`   Total agents receiving broadcast: ${agents.length}`);
    } catch (error) {
        console.error('❌ Broadcast failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run tests
if (require.main === module) {
    console.log('🚀 Starting production API tests...');
    console.log('This will automatically test with connected agents\n');

    setTimeout(() => {
        testAPI();
    }, 1000);
}

module.exports = { testAPI, generateTestData };
