const msyql = require('mysql2/promise');
const env = require('./env');

const pool = msyql.createPool({
host: env.db.host,
port: env.db.port,
user: env.db.user,
password: env.db.password,
database: env.db.database,
waitForConnections: true,
connectionLimit: 10
});

module.exports= pool;