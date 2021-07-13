import dotEnv from 'dotenv'
import {createPool, Pool} from 'mysql2/promise'

dotEnv.config({
  path: `./env/development.env`
});

const pool: Pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 3306,
  connectionLimit: 2,
  waitForConnections: false,
  dateStrings: [
    'DATE',
    'DATETIME'
  ]
});

pool.on('acquire', function (connection) {
  console.log(`acquire thread ID : ${connection.threadId}`)
});

pool.on('release', function (connection) {
  console.log(`release thread ID : ${connection.threadId}`)
});

export default pool;
