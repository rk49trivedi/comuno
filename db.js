const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'patient_app',      // default in Laragon
    password: 'kGrJfsMCzX6mtM8B',      // usually empty in Laragon
    database: 'patient_app'
});

connection.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL');
});

module.exports = connection;