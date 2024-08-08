const mysql = require("mysql2/promise");

export default async function postToStockDB(req, res) {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_SCHEME,
    });
}  