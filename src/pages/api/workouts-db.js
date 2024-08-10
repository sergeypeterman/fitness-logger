const { GoogleSpreadsheet } = require("google-spreadsheet");

import {
  validateValues,
  checkIntegerRange,
  checkDate,
} from "@/components/functions";
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
    const doc = new GoogleSpreadsheet(sheetId, jwtFromEnv);

    await copyAllTrainingDataFromDocToDB(doc, db);
  } catch (err) {
    console.log(err);
  } finally {
    db.end();
  }

  const {
    query: { workout },
  } = req;

  if (workout) {
    //console.log(`api: ${JSON.parse(workout).id}`);
    res.status(200).json({ message: "testStr", status: "done" });
  } else {
    res.status(500).json({ message: "some error" });
  }
}
/***************functions**********************/
async function copyAllTrainingDataFromDocToDB(doc, db) {
  try {
    await doc.loadInfo(); // loads document properties and worksheets

    const sheets = doc.sheetsByIndex;
    const sheetTitles = sheets.map((item) => item.title);

    const docData = [];
    for (const theSheet of sheets) {
      await theSheet.loadCells();
      const rows = await theSheet.getRows();
      console.log(
        `api: there are ${rows.length} rows in the ${theSheet.title}`
      );
      const sheetData = rows.map((theRow) => {
        const row = {};
        for (const header of theSheet.headerValues) {
          const value = theRow.get(header);
          const valueNaN = Number.isNaN(+value) ? value : +value;
          row[header] = valueNaN;
        }
        // console.log(JSON.stringify(row));
        // console.log(`Squat: ${typeof row.Squat}, ${row.Squat}`);
        return row;
      });
      const sheetObj = { program: theSheet.title, data: sheetData };
      docData.push(sheetObj);
    }

    for (const programSheet of docData) {
      //getting data ready for workouts table
      //getting program id from programs table
      const programID = await getProgramIDfromDB(db, programSheet);

      for (const theWorkout of programSheet.data) {
        //getting exercises list from exercises table
        const programData = await getProgramDataFromDB(db, theWorkout);
        //insert workout into the table
        await insertWorkoutToDB(programID, programData, theWorkout, db);
      }
    }
    return { status: "Import: success" };
  } catch (err) {
    throw new Error(err);
  }
}

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

async function getProgramIDfromDB(db, dataObject) {
  const getProgramIDQuery = `SELECT id FROM programs WHERE name = '${dataObject.program}'`;
  let result = await db.query(getProgramIDQuery);
  const programID = result[0][0].id;
  console.log(`program id: ${programID}`);
  return programID;
}

async function getProgramDataFromDB(db, dataObject) {
  const programData = [];

  const exercisesNum = Object.keys(dataObject).length;

  for (let i = 4; i < exercisesNum; i++) {
    const exerciseName = Object.keys(dataObject)[i];
    //console.log(`'${exerciseName}'`);
    const getExerciseIDQuery = `SELECT id FROM exercises WHERE name = '${exerciseName}'`;
    let result = await db.query(getExerciseIDQuery);
    const exerciseID = result[0][0].id;
    //console.log(`${Object.keys(dataObject)[i]} id: ${exerciseID}`);
    const exerciseData = {
      exercise_id: exerciseID,
      workload: dataObject[exerciseName],
    };
    programData.push(exerciseData);
  }
  //console.log(programData);
  return programData;
}

async function insertWorkoutToDB(programID, programData, dataObject, db) {
  const dbQuery = `INSERT INTO workouts(program, program_data, date) VALUES (${programID},'${JSON.stringify(
    programData
  )}', STR_TO_DATE('${dataObject["Date"]}',"%m/%d/%Y"))`;
  //console.log(dbQuery);
  await db.query(dbQuery);
}
