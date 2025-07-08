// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');  // Make sure db.js exists with your MySQL config

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// POST route for incomingCall, outgoingCall, callRecording
app.post('/api/:type', (req, res) => {
    const { type } = req.params;

    // Allowed event types
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    // Validate type param
    if (!validTypes.includes(type)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid event type'
        });
    }

    const data = req.body;

    // Insert data into MySQL
    const query = 'INSERT INTO call_logs (type, data) VALUES (?, ?)';
    db.query(query, [type, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Database error'
            });
        }

        // Success response
        res.json({
            status: 'success',
            message: `${type} event stored successfully`,
            id: result.insertId
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});


// CREATE TABLE call_logs (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     type VARCHAR(50),
//     data JSON,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );