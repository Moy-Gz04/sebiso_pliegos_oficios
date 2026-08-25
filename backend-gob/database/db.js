const { Pool } = require('pg');

const pool = new Pool({

    user: process.env.DB_USER,

    host: process.env.DB_HOST,

    database: process.env.DB_NAME,

    password: process.env.DB_PASSWORD,

    port: process.env.DB_PORT,

    ssl: {
        rejectUnauthorized: false
    },

    max: 15,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 5000

});

// CRÍTICO: sin esto, un error en una conexión idle tumba TODO el proceso
pool.on('error', (err) => {

    console.error('Error inesperado en cliente idle del pool:', err);

});

module.exports = pool;