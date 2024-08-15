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
        query: { selected, requestType },
      } = req;

      console.log(req.query);
      console.log(requestType);
      console.log(selected);

      if (requestType === "latest") {
        if (selected) {
          //if it's an actual data request
          //for the program with <selected> program name we're getting newest workout' data
          const readAttempt = await getNewestSelectedWorkoutFromDB(
            db,
            selected
          );

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
      } else if (requestType === "list") {
        //console.log("api-hi");

        const latestWorkoutsListQuery = `SELECT program, DATE_FORMAT(date, '%M %d,%Y') AS formatted_date, program_settings, name FROM workouts
                                          inner join programs on workouts.program = programs.id
                                          order by date desc`;
        const result = await db.query(latestWorkoutsListQuery);
        const latestWorkoutsList = result[0];
        //console.log(latestWorkoutsList);
        
        res.status(200).json({ workoutHistory: latestWorkoutsList });
      }
    } else {
      //in case it's not either GET or POST
      res.status(400).end(`${req.method} or type are Not Allowed`);
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
