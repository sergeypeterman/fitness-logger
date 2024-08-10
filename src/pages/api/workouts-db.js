const { GoogleSpreadsheet } = require("google-spreadsheet");

import { copyAllTrainingDataFromDocToDB } from "@/components/functions";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const sheetId = process.env.GOOGLE_SHEET_ID;

const jwtFromEnv = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: SCOPES,
});

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
    //import everything from sheets to db, no validation yet
    //const doc = new GoogleSpreadsheet(sheetId, jwtFromEnv);
    //await copyAllTrainingDataFromDocToDB(doc, db);
  } catch (err) {
    console.log(err);
  } finally {
    db.end();
  }

  try {
    // ***** POST *****
    // ****************
    if (req.method == "POST") {
      const {
        query: { selected },
      } = req;

      readValuesAndUpdateDoc();

      if (updateAttempt.success) {
        res.status(200).json({ message: updateAttempt.message });
      } else {
        res.status(400).end(`${updateAttempt.message}`);
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

        res.status(200).json({ titles: sheetTitles });
      } else if (selected) {
        //if it's an actual data request
        //for the program with <selected> program name we're getting:
        // • headers (e.g.): [id,	Date,	Reps,	Rest (sec), Squat,	Static lunge,	Barbell row, Barbell press,	Running]
        // • values (e.g.): [27,	8/6/2024,	2x5,	120,	120,	60,	65,	90,	5]
        // and returning them
        const readAttempt = await readSelectedProgram(doc, selected);
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
  }
}
/*************************************/

const testP = {
  program: "Break-In Squat",
  data: [
    {
      id: 16,
      Date: "3/6/2024",
      Reps: "3x8",
      "Rest (sec)": 60,
      Squat: 90,
      "Static lunge": 50,
      "Dumbbell row": 60,
      "Barbell press": 70,
      Running: 6,
    },
    {
      id: 15,
      Date: "3/1/2024",
      Reps: "3x8",
      "Rest (sec)": 60,
      Squat: 90,
      "Static lunge": 40,
      "Dumbbell row": 65,
      "Barbell press": 65,
      Running: 6,
    },
  ],
};

/* const testExerciseArray = [
  { name: "Squat", workload: 120 },
  { name: "Static lunge", workload: 60 },
  { name: "Barbell row", workload: 65 },
  { name: "Barbell press", workload: 90 },
  { name: "Running", workload: 5 },
];

let testRecord = new trainingRecord(
  1,
  "8/6/2024",
  "2x5",
  "120",
  testExerciseArray
); */

/* const testPrograms = [
  { name: "Strength Squat", sets: 2, reps: 5, rest: 120 },
  { name: "Strength Deadlift", sets: 2, reps: 5, rest: 120 },
  { name: "Break-In Squat", sets: 2, reps: 15, rest: 60 },
  { name: "Break-In Deadlift", sets: 2, reps: 15, rest: 60 },
];

const exercises = [
  "Squat",
  "Static lunge",
  "Barbell row",
  "Barbell press",
  "Deadlift",
  "Dynamic lunge",
  "Shoulder press",
  "Pulldowns",
  "Running",
  "Good morning",
  "Rowing machine",
  "Seated row",
  "Pullups",
]; */
