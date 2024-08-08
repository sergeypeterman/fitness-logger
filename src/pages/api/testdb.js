const mysql = require("mysql2/promise");

export default async function useMysqlDB(req, res) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEME,
  });

  const database = "workouts";
  const dbQuery = `SELECT * FROM ${database}`;
  const testStr = await db.query(dbQuery);

  const {
    query: { str },
  } = req;

  if (str) {
    console.log(str);
    res.status(200).json({ message: testStr });
  } else {
    res.status(500).json({ message: "some error" });
  }
}
