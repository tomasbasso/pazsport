const sql = require('mssql/msnodesqlv8');
require('dotenv').config();

const config = {
  connectionString: `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=yes;`,
};

let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await new sql.ConnectionPool(config).connect();
      console.log('✅ Conectado a SQL Server -', process.env.DB_NAME);
    } catch (err) {
      console.error('❌ Error conectando a SQL Server:', err.message);
      throw err;
    }
  }
  return pool;
}

module.exports = { sql, getPool };
