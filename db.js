const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // default in Laragon
    password: '',      // usually empty in Laragon
    database: 'comuno'
});

connection.connect(err => {
    if (err) {
        console.error('MySQL connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL');
});

module.exports = connection;
