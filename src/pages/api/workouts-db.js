const { GoogleSpreadsheet } = require("google-spreadsheet");

import {
  copyAllTrainingDataFromDocToDB,
  getProgramIDfromDB,
  getProgramSettingsfromDB,
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

        const getProgramsListQuery = `SELECT name FROM programs`;
        const result = await db.query(getProgramsListQuery);
        const programsListQuery = result[0];
        const programs = programsListQuery.map((item) => item.name);

        res.status(200).json({ titles: programs });
      } else if (selected) {
        //if it's an actual data request
        //for the program with <selected> program name we're getting:
        // • headers (e.g.): [id,	Date,	Reps,	Rest (sec), Squat,	Static lunge,	Barbell row, Barbell press,	Running]
        // • values (e.g.): [27,	8/6/2024,	2x5,	120,	120,	60,	65,	90,	5]
        // and returning them
        const readAttempt = { success: false }; //await readSelectedProgramFromDB(doc, selected);

        const programSettings = await getProgramSettingsfromDB(db, { program: selected });
        console.log(`program: ${JSON.stringify(programSettings)}`);
        const getProgramIDQuery = `SELECT * FROM workouts WHERE program = ${programSettings.id} ORDER BY date DESC LIMIT 1`;
        const result = await db.query(getProgramIDQuery);
        const newestWorkout = result[0][0];

        console.log(`newestWorkout - ${JSON.stringify(newestWorkout)}`);

        const data = {};
        data.headers = ["id", "Date", "Reps", "Rest (sec)"];

        const workoutDate = new Date(newestWorkout.date).toLocaleDateString("fr-ca");
        data.values = [newestWorkout.id, workoutDate, `${programSettings.sets}x${programSettings.reps}`, programSettings.rest];

        for (const exercise of newestWorkout.program_data) {
          const getProgramIDQuery = `SELECT name FROM exercises WHERE id = ${exercise.exercise_id}`;
          const result = await db.query(getProgramIDQuery);
          const exercise_name = result[0][0].name;
          data.headers.push(exercise_name);
          data.values.push(+exercise.workload);
        }

        console.log(data);
        readAttempt.success = true;
        readAttempt.data = data;

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
/*************************************/

const refD = [
  {
    id: 82,
    program: 1,
    program_data: [
      { workload: 120, exercise_id: 1 },
      { workload: 60, exercise_id: 2 },
      { workload: 65, exercise_id: 3 },
      { workload: 90, exercise_id: 4 },
      { workload: 5, exercise_id: 9 },
    ],
    comment: null,
    date: "2024-08-05T23:00:00.000Z",
  },
];

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
