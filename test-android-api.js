// test-android-api.js - Test Android-specific minimal data API
const axios = require('axios');

const SERVER_URL = 'http://31.97.206.244:3000';

// Test with a specific Android client phone number
const androidPhoneNumber = process.argv[2] || '+919876543210';

console.log('📱 Testing Android API with minimal data...');
console.log(`🎯 Target Android client: ${androidPhoneNumber}`);

// Sample call data (complex format from your system)
const sampleCallData = {
    call_details: {
        live_event: 'evt_completed_with_recording',
        sme_id: 10001497,
        call_direction: 'OUTGOING',
        session_id: '0724515827799288',
        duration: 77,
        longcode: 918035392130,
        customer_number: '+919662682525',
        overall_call_status: 'patched',
        call_recording_status: 0,
        disconnected_by: 'customer',
        customer_name: null,
        remarks: null,
        connected_duration: 62,
        ringing_duration: 7,
        ivr_duration: 0,
        dtmf: '0',
        flow_name: null,
        queue_name: null,
        start_date_time: '2025-07-30 08:59:16',
        end_date_time: '2025-07-30 09:00:33'
    },
    customer_details: {
        sme_id: 10001497,
        customer_number: '+919662682525',
        customer_name: null,
        call_status: 'notpatched',
        duration: 77,
        connected_duration: 62,
        ringing_duration: 7
    },
    agent_details: [
        {
            agent_id: '5274',
            agent_name: 'Pratik',
            agent_email: 'pratik.tank9@gmail.com',
            agent_number: '+919924936750',
            call_status: 'patched',
            call_route_reason: '',
            duration: 72,
            connected_duration: 72,
            ringing_duration: 5,
            start_date_time: '2025-07-30 08:59:21',
            end_date_time: '2025-07-30 09:00:33'
        }
    ],
    recording_details: {}
};

async function testAndroidAPI() {
    try {
        console.log('\n1️⃣ Testing Android Incoming Call API...');
        const incomingResponse = await axios.post(
            `${SERVER_URL}/api/android/incomingCall/number/${androidPhoneNumber}`,
            sampleCallData,
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        console.log('✅ Android API Response (Minimal):');
        console.log(JSON.stringify(incomingResponse.data, null, 2));
        
        console.log('\n2️⃣ Testing Android Outgoing Call API...');
        const outgoingResponse = await axios.post(
            `${SERVER_URL}/api/android/outgoingCall/number/${androidPhoneNumber}`,
            sampleCallData,
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        console.log('✅ Android API Response (Minimal):');
        console.log(JSON.stringify(outgoingResponse.data, null, 2));
        
        console.log('\n3️⃣ Testing Android Call Recording API...');
        const recordingResponse = await axios.post(
            `${SERVER_URL}/api/android/callRecording/number/${androidPhoneNumber}`,
            sampleCallData,
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        console.log('✅ Android API Response (Minimal):');
        console.log(JSON.stringify(recordingResponse.data, null, 2));
        
        console.log('\n🎉 Android API testing completed!');
        console.log('\n📱 Android client receives only:');
        console.log('   - agentPhone: +919924936750');
        console.log('   - customerPhone: +919662682525');
        console.log('   - live_event: evt_completed_with_recording');
        console.log('   - timestamp: (current time)');
        
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.log(`❌ Android client ${androidPhoneNumber} is not connected`);
            console.log('💡 Start an Android client first:');
            console.log(`   node android-client-example.js`);
        } else {
            console.error('❌ Error testing Android API:', error.message);
            if (error.response) {
                console.error('Response:', error.response.data);
            }
        }
    }
}

async function checkConnectedAgents() {
    try {
        console.log('\n📋 Checking connected agents...');
        const response = await axios.get(`${SERVER_URL}/api/agents`);
        
        console.log(`✅ Total connected agents: ${response.data.totalAgents}`);
        
        const mobileClients = response.data.agents.filter(agent => 
            agent.agentType === 'mobile_client'
        );
        
        if (mobileClients.length > 0) {
            console.log('📱 Mobile clients connected:');
            mobileClients.forEach(client => {
                console.log(`   ${client.agentNumber} - ${client.agentName}`);
            });
        } else {
            console.log('⚠️  No mobile clients connected');
            console.log('💡 Start a mobile client: node android-client-example.js');
        }
        
    } catch (error) {
        console.error('❌ Error checking agents:', error.message);
    }
}

// Run tests
async function runTests() {
    await checkConnectedAgents();
    await testAndroidAPI();
}

if (require.main === module) {
    console.log('🚀 Starting Android API tests...');
    console.log('This tests the minimal data API specifically for Android clients\n');
    
    setTimeout(() => {
        runTests();
    }, 1000);
}

module.exports = { testAndroidAPI, sampleCallData };
