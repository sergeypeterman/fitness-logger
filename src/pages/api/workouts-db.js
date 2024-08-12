import {
  createNewWorkoutForDB,
  getNewestSelectedWorkoutFromDB,
  getProgramsListFromDB,
  insertNewWorkoutToDB,
  validateValues,
} from "@/components/functions";

const mysql = require("mysql2/promise");

export default async function useMysqlDB(req, res) {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEME,
  });

  try {
    // ***** POST *****
    // ****************
    if (req.method == "POST") {
      const {
        query: { selected },
      } = req;

      //reading new values, validating (and normalizing type) and writing them to a new row
      // • values (e.g.):   [27, 8/6/2024, 2x5, 120, 120, 60,  65, 90, 5]
      const values = [...req.body];
      let valStatus = validateValues(values);

      //in the values are valid, write into the DB
      if (valStatus.value) {
        // getting .id of the selected program, to write new workout with

        const newWorkoutForDB = await createNewWorkoutForDB(
          db,
          selected,
          valStatus.newValues
        );

        const insertAttempt = await insertNewWorkoutToDB(db, newWorkoutForDB);

        if (insertAttempt.success) {
          res.status(200).json({ message: "Added" });
        } else {
          console.log(`API: ${insertAttempt.message}`, insertAttempt.error);
          console.log("API: mysql result:", insertAttempt.result);
          res.status(400).end(`${insertAttempt.message}`);
        }
      } else {
        res.status(400).end(`${valStatus.message}`);
      }
    }
    // ***** GET *****
    // ****************
    else if (req.method == "GET") {
      const {
        query: { selected },
      } = req;

      //reading encoded word 'initial'
      const isInitial = Buffer.from("initial").toString("base64");

      if (selected == isInitial) {
        //if it's an initial request (react state "fetched" = 0)
        //reading existing programs and returning their names in array 'titles'
        //after that in Settings component we're selecting the first one [0] <-- this should be rewrited

        const programs = await getProgramsListFromDB(db);

        res.status(200).json({ titles: programs });
      } else if (selected) {
        //if it's an actual data request
        //for the program with <selected> program name we're getting newest workout' data
        const readAttempt = await getNewestSelectedWorkoutFromDB(db, selected);

        //sending the read values to frontend
        if (readAttempt.success) {
          res.status(200).json({
            headers: readAttempt.data.headers,
            values: readAttempt.data.values,
          });
        } else {
          //if there are only initial headers, return error
          res.status(500).end("Not enough data in the sheet");
        }
      } else {
        res.status(400).end(`Unknown Program selected`);
      }
    } else {
      //in case it's not either GET or POST
      res.status(400).end(`${req.method} Not Allowed`);
    }
  } catch (err) {
    console.log("error api " + err + err.code);
    console.log(err);
    console.log(typeof err);
    err.errno === "ENOTFOUND"
      ? res.status(503).json("Looks like you're offline")
      : res.status(500).json(err);
  } finally {
    db.end();
  }
}
