// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');  // Ensure db.js is correct and working

const app = express();
const port = process.env.PORT || 3000;  // ✅ Dynamic port

app.use(bodyParser.json());

app.post('/api/:type', (req, res) => {
    const { type } = req.params;
    const validTypes = ['incomingCall', 'outgoingCall', 'callRecording'];

    if (!validTypes.includes(type)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid event type'
        });
    }

    const data = req.body;
    const query = 'INSERT INTO call_logs (type, data) VALUES (?, ?)';

    db.query(query, [type, JSON.stringify(data)], (err, result) => {
        if (err) {
            console.error('Database Insert Error:', err.message);
            return res.status(500).json({
                status: 'error',
                message: 'Database error'
            });
        }

        res.json({
            status: 'success',
            message: `${type} event stored successfully`,
            id: result.insertId
        });
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
