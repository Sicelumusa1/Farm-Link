const oracledb = require('oracledb');
require('dotenv').config();

// Set Oracle client path for the application
try {
  oracledb.initOracleClient({ libDir: process.env.ORACLE_HOME });
} catch (err) {
  console.log('Oracle client initialization (optional):', err.message);
}

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING,
  configDir: process.env.TNS_ADMIN
};

async function initPool() {
  try {
    await oracledb.createPool({
      ...dbConfig,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle ADB connection pool created successfully');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    process.exit(1);
  }
}

async function testConnection() {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute('SELECT SYSDATE as now FROM dual');
    console.log('Database connection test passed:', result.rows[0].NOW);
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = { oracledb, initPool, testConnection };