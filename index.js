// index.js or server.js
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS enabled for Android apps (or any client)
const io = new Server(server, {
  cors: {
    origin: "*",     // For testing allow all origins; update to your app URL/domain in production
    methods: ["GET", "POST"]
  }
});

const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Store connected agents with their identities (Map: agentId -> socket, Map: agentNumber -> agentId)
const connectedAgents = new Map();
const agentNumberToId = new Map();

io.on('connection', (socket) => {
    console.log(`🔗 WebSocket client connected: ${socket.id}`);

    // Wait for agent registration
    socket.on('registerAgent', (agentData) => {
        const { agentId, agentNumber, agentName, agentType } = agentData;

        if (!agentId) {
            socket.emit('registrationError', { message: 'Agent ID is required' });
            return;
        }

        if (!agentNumber) {
            socket.emit('registrationError', { message: 'Agent Number (phone number) is required' });
            return;
        }

        // Special handling for database services - they can have duplicate "phone numbers"
        if (agentNumber !== "DATABASE_SERVICE" && agentNumberToId.has(agentNumber)) {
            socket.emit('registrationError', { message: `Agent number ${agentNumber} is already registered` });
            return;
        }

        // Store agent information
        const agentInfo = {
            socket: socket,
            agentId: agentId,
            agentNumber: agentNumber,
            agentName: agentName || `Agent-${agentNumber}`,
            agentType: agentType || 'default',
            connectedAt: new Date(),
            socketId: socket.id
        };

        connectedAgents.set(agentId, agentInfo);

        // Only map phone numbers for real phone numbers, not database services
        if (agentNumber !== "DATABASE_SERVICE") {
            agentNumberToId.set(agentNumber, agentId);
        }

        socket.agentId = agentId;
        socket.agentNumber = agentNumber;

        console.log(`✅ Agent registered: ${agentId} (${agentNumber}) - ${agentInfo.agentName}`);
        socket.emit('registrationSuccess', {
            message: 'Agent registered successfully',
            agentId: agentId,
            agentNumber: agentNumber,
            connectedAgents: Array.from(connectedAgents.keys()),
            connectedNumbers: Array.from(agentNumberToId.keys())
        });

        // Notify other agents about new connection
        socket.broadcast.emit('agentConnected', {
            agentId: agentId,
            agentNumber: agentNumber,
            agentName: agentInfo.agentName,
            agentType: agentInfo.agentType
        });
    });

    socket.on('disconnect', () => {
        if (socket.agentId && socket.agentNumber) {
            console.log(`❌ Agent disconnected: ${socket.agentId} (${socket.agentNumber})`);
            connectedAgents.delete(socket.agentId);

            // Only remove from phone number mapping if it's not a database service
            if (socket.agentNumber !== "DATABASE_SERVICE") {
                agentNumberToId.delete(socket.agentNumber);
            }

            // Notify other agents about disconnection
            socket.broadcast.emit('agentDisconnected', {
                agentId: socket.agentId,
                agentNumber: socket.agentNumber
            });
        } else {
            console.log(`❌ Unregistered client disconnected: ${socket.id}`);
        }
    });
});

// POST route for call events - broadcast to all agents
app.post('/api/:type', (req, res) => {
    const { type } = req.params;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    const data = req.body;

    if (connectedAgents.size > 0) {
        // Emit event to all connected agents
        connectedAgents.forEach((agentInfo, agentId) => {
            agentInfo.socket.emit(type, data);
        });
        return res.json({
            status: 'success',
            message: `${type} event sent to ${connectedAgents.size} agent(s)`,
            connectedAgents: Array.from(connectedAgents.keys())
        });
    } else {
        return res.status(503).json({ status: 'error', message: 'No agents connected' });
    }
});

// POST route for sending events to specific agent by phone number
app.post('/api/:type/number/:agentNumber', (req, res) => {
    const { type, agentNumber } = req.params;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    const data = req.body;
    const agentId = agentNumberToId.get(agentNumber);

    if (!agentId) {
        return res.status(404).json({
            status: 'error',
            message: `Agent with phone number ${agentNumber} not found or not connected`,
            connectedNumbers: Array.from(agentNumberToId.keys())
        });
    }

    const agentInfo = connectedAgents.get(agentId);

    // Extract phone numbers from the data
    let extractedAgentPhone = null;
    let extractedCustomerPhone = null;

    // Extract agent phone number
    if (data.agent_details && data.agent_details.agent_number) {
        extractedAgentPhone = data.agent_details.agent_number;
    } else if (data.agent_details && Array.isArray(data.agent_details) && data.agent_details.length > 0) {
        extractedAgentPhone = data.agent_details[0].agent_number;
    }

    // Extract customer phone number
    if (data.call_details && data.call_details.customer_number) {
        extractedCustomerPhone = data.call_details.customer_number;
    } else if (data.customer_details && data.customer_details.customer_number) {
        extractedCustomerPhone = data.customer_details.customer_number;
    } else if (data.from) {
        extractedCustomerPhone = data.from;
    }

    // Send simplified data to Android/mobile clients
    if (agentInfo.agentType === 'mobile_client' || agentInfo.agentType === 'android_client') {
        const simplifiedData = {
            type: type,
            agentPhone: extractedAgentPhone || agentNumber,
            customerPhone: extractedCustomerPhone,
            timestamp: new Date().toISOString(),
            live_event: data.live_event || data.call_details?.live_event || null
        };
        agentInfo.socket.emit(type, simplifiedData);
    } else {
        // Send full data to other types of agents
        agentInfo.socket.emit(type, data);
    }

    // Also send to all database services for logging (full data)
    connectedAgents.forEach((dbAgentInfo, dbAgentId) => {
        if (dbAgentInfo.agentType === 'database_service') {
            dbAgentInfo.socket.emit(type, {
                ...data,
                targetPhoneNumber: agentNumber // Add context for database service
            });
        }
    });

    return res.json({
        status: 'success',
        message: `${type} event sent to agent ${agentNumber}`,
        targetAgentNumber: agentNumber,
        targetAgentId: agentId,
        agentPhone: agentNumber,
        customerPhone: data.call_details?.customer_number || data.customer_details?.customer_number || data.from || null
    });
});

// POST route for sending events to specific agent by agentId (backup method)
app.post('/api/:type/agent/:agentId', (req, res) => {
    const { type, agentId } = req.params;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    const data = req.body;
    const agentInfo = connectedAgents.get(agentId);

    if (!agentInfo) {
        return res.status(404).json({
            status: 'error',
            message: `Agent ${agentId} not found or not connected`,
            connectedAgents: Array.from(connectedAgents.keys())
        });
    }

    agentInfo.socket.emit(type, data);
    return res.json({
        status: 'success',
        message: `${type} event sent to agent ${agentId}`,
        targetAgent: agentId
    });
});

// POST route for sending events to multiple specific agents by phone numbers
app.post('/api/:type/numbers', (req, res) => {
    const { type } = req.params;
    const { agentNumbers, ...data } = req.body;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    if (!agentNumbers || !Array.isArray(agentNumbers)) {
        return res.status(400).json({ status: 'error', message: 'agentNumbers array is required in request body' });
    }

    const sentTo = [];
    const notFound = [];

    agentNumbers.forEach(agentNumber => {
        const agentId = agentNumberToId.get(agentNumber);
        if (agentId) {
            const agentInfo = connectedAgents.get(agentId);
            agentInfo.socket.emit(type, data);
            sentTo.push(agentNumber);
        } else {
            notFound.push(agentNumber);
        }
    });

    return res.json({
        status: sentTo.length > 0 ? 'success' : 'error',
        message: `${type} event sent to ${sentTo.length} agent(s)`,
        sentTo: sentTo,
        notFound: notFound.length > 0 ? notFound : undefined,
        connectedNumbers: Array.from(agentNumberToId.keys())
    });
});

// POST route for sending events to multiple specific agents by agentIds (backup method)
app.post('/api/:type/agents', (req, res) => {
    const { type } = req.params;
    const { agentIds, ...data } = req.body;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({ status: 'error', message: 'Invalid event type' });
    }

    if (!agentIds || !Array.isArray(agentIds)) {
        return res.status(400).json({ status: 'error', message: 'agentIds array is required in request body' });
    }

    const sentTo = [];
    const notFound = [];

    agentIds.forEach(agentId => {
        const agentInfo = connectedAgents.get(agentId);
        if (agentInfo) {
            agentInfo.socket.emit(type, data);
            sentTo.push(agentId);
        } else {
            notFound.push(agentId);
        }
    });

    return res.json({
        status: sentTo.length > 0 ? 'success' : 'error',
        message: `${type} event sent to ${sentTo.length} agent(s)`,
        sentTo: sentTo,
        notFound: notFound.length > 0 ? notFound : undefined,
        connectedAgents: Array.from(connectedAgents.keys())
    });
});

// GET route to list all connected agents
app.get('/api/agents', (req, res) => {
    const agents = Array.from(connectedAgents.entries()).map(([agentId, agentInfo]) => ({
        agentId: agentId,
        agentNumber: agentInfo.agentNumber,
        agentName: agentInfo.agentName,
        agentType: agentInfo.agentType,
        connectedAt: agentInfo.connectedAt,
        socketId: agentInfo.socketId
    }));

    return res.json({
        status: 'success',
        totalAgents: agents.length,
        agents: agents,
        connectedNumbers: Array.from(agentNumberToId.keys())
    });
});

// GET route to check if specific agent is connected by phone number
app.get('/api/agents/number/:agentNumber', (req, res) => {
    const { agentNumber } = req.params;
    const agentId = agentNumberToId.get(agentNumber);

    if (!agentId) {
        return res.status(404).json({
            status: 'error',
            message: `Agent with phone number ${agentNumber} not found or not connected`
        });
    }

    const agentInfo = connectedAgents.get(agentId);
    return res.json({
        status: 'success',
        agent: {
            agentId: agentId,
            agentNumber: agentInfo.agentNumber,
            agentName: agentInfo.agentName,
            agentType: agentInfo.agentType,
            connectedAt: agentInfo.connectedAt,
            socketId: agentInfo.socketId
        }
    });
});

// GET route to check if specific agent is connected by agentId
app.get('/api/agents/:agentId', (req, res) => {
    const { agentId } = req.params;
    const agentInfo = connectedAgents.get(agentId);

    if (!agentInfo) {
        return res.status(404).json({
            status: 'error',
            message: `Agent ${agentId} not found or not connected`
        });
    }

    return res.json({
        status: 'success',
        agent: {
            agentId: agentId,
            agentNumber: agentInfo.agentNumber,
            agentName: agentInfo.agentName,
            agentType: agentInfo.agentType,
            connectedAt: agentInfo.connectedAt,
            socketId: agentInfo.socketId
        }
    });
});

// Start server
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📡 Socket.IO server ready for agent connections`);
    console.log(`🔗 Available endpoints:`);
    console.log(`   GET  /api/agents - List all connected agents`);
    console.log(`   GET  /api/agents/number/:agentNumber - Check agent by phone number`);
    console.log(`   GET  /api/agents/:agentId - Check agent by ID`);
    console.log(`   POST /api/:type - Broadcast to all agents`);
    console.log(`   POST /api/:type/number/:agentNumber - Send to agent by phone number`);
    console.log(`   POST /api/:type/agent/:agentId - Send to agent by ID`);
    console.log(`   POST /api/:type/numbers - Send to multiple agents by phone numbers`);
    console.log(`   POST /api/:type/agents - Send to multiple agents by IDs`);
    console.log(`📞 Primary method: Use phone numbers (agentNumber) for targeting agents`);
});
