export function validateDateString(year, month, day) {
  // checking if the date exists. Eg Feb 30, Apr 31 and so on,
  let y = Number(year);
  y > 0 && y < 100 ? (y += 1900) : (y = y); // if year is from 0000 to 0100 it's treated like 19xx
  const m = Number(month) - 1;
  const d = Number(day);

  const validDate = new Date(y, m, d);

  //console.log(`year: ${year}, y: ${y}, validDate: ${validDate}`);

  let yearMatches = validDate.getFullYear() === y;
  let monthMatches = validDate.getMonth() === m;
  let dayMatches = validDate.getDate() === d;

  return yearMatches && monthMatches && dayMatches;
}

export function checkDate(newDate, rangeDate) {
  // log workout no more than a rangeDate days forward and no earlier that last year

  const today = new Date().toLocaleDateString("fr-ca").split("-");

  let input = newDate.split("-"); // [YYYY,MM,DD]
  //days between today and entered date
  let daysDiff = Math.floor(
    (Date.parse(newDate) - Date.parse(today)) / (1000 * 60 * 60 * 24) //days
  );
  console.log(input[0], input[1], input[2]);
  if (validateDateString(input[0], input[1], input[2])) {
    if (Math.abs(input[0] - today[0]) > 1) {
      //if input year is more than 1 year away from today
      return { dateInRange: "year", message: `It's ${today[0]}, Morty` };
    } else if (daysDiff > rangeDate) {
      return {
        dateInRange: false,
        message: `The date is more than a week away`,
      };
    } else {
      return {
        dateInRange: true,
        message: `The date is correct`,
      };
    }
  } else {
    return { dateInRange: false, message: "Wrong Date" };
  }
}

export function checkIntegerRange(input, min, max) {
  if (Number.isInteger(input)) {
    if (input > max) {
      return { intInRange: false, message: `too large, ${max} max` };
    } else if (input < min) {
      return { intInRange: false, message: `too small, min ${min}` };
    } else {
      return { intInRange: true, message: `correct` };
    }
  } else {
    return { intInRange: false, message: `${input} is not integer` };
  }
}

export function validateValues(values) {
  //checking structure and normalizing type:
  //id	Date	Reps	Rest (sec)	[num, date, NumxNum, num]
  //exercises: [num]
  /* return { 
    value: result (bool),
    message: message(string),
    newValues: newValues([], new normalized array), 
    errorIndices:errorIndices ([bool], validation result on every 'values' element)} */

  let message = "";
  let newValues = [...values];
  let errorIndices = [];

  //console.log(values);
  if (values.length > 4) {
    let result = values.reduce((res, item, ind) => {
      let inRange;

      if (item === "") {
        return false;
      }
      //console.log(`Reduce, ind = ${ind} item = ${item} result = ${res}`);

      if (ind === 0) {
        //id
        newValues[ind] = Number(item);
        inRange = checkIntegerRange(newValues[ind], 0, 500000); // 5.000.000 cells / 10 columns

        errorIndices.push(inRange.intInRange);
        return res && inRange.intInRange;
      } else if (ind === 1) {
        //date
        inRange = checkDate(item, 7);
        //the function can return 'year' in case of incorrect year, so we check for strict true:
        inRange.dateInRange = inRange.dateInRange === true ? true : false;

        errorIndices.push(inRange.dateInRange);
        return res && inRange.dateInRange;
      } else if (ind === 2) {
        //reps
        let repsArr = item.split("x");
        inRange = checkIntegerRange(Number(repsArr[0]), 1, 99);
        if (inRange.intInRange) {
          inRange = checkIntegerRange(Number(repsArr[1]), 1, 999);

          errorIndices.push(inRange.intInRange);
          return res && inRange.intInRange;
        } else {
          errorIndices.push(false);
          return false;
        }
      } else if (ind === 3) {
        //rest
        newValues[ind] = Number(item);
        inRange = checkIntegerRange(newValues[ind], 0, 999);

        errorIndices.push(inRange.intInRange);
        return res && inRange.intInRange;
      } else {
        //exercises
        newValues[ind] = { workload: Number(item.workload), name: item.name };
        inRange = checkIntegerRange(newValues[ind].workload, 0, 999);

        errorIndices.push(inRange.intInRange);
        return res && inRange.intInRange;
      }
    }, true);
    //console.log(newValues);
    message = result ? "API: correct data" : "API: wrong data input";
    return {
      value: result,
      message: message,
      newValues: newValues,
      errorIndices: errorIndices,
    };
  } else {
    return {
      value: false,
      message: "API: not enough data to post",
      newValues: [],
      errorIndices: [],
    };
  }
}

//extending Date object
Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  //console.log(date);
  return date;
};
//extending Date object
Date.prototype.addDate = function (years, months, days) {
  let date = new Date(this.valueOf());
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);
  //console.log(date);
  return date;
};

//taking doc <GoogleSpreadsheet> and selected program index to read the program from the spreadsheet
export async function readSelectedProgram(doc, selected) {
  const sheets = doc.sheetsByIndex;
  const sheetTitles = sheets.map((item) => item.title);

  const programIndex = sheetTitles.indexOf(selected);

  const sheet = doc.sheetsByIndex[programIndex];

  await sheet.loadCells();
  const rows = await sheet.getRows();
  //is it a first workout in the sheet? if yes, fill values with 0-s
  let values = [];
  if (rows.length) {
    values = [...rows[0]._rawData]; //getting values
  } else {
    sheet.headerValues.map((item, ind) => (values[ind] = 0));
  }
  //sending headers and corresponding values, if there are >4 headers
  // if <= 4 headers, error, there are no exercises
  const hValues = [...sheet.headerValues];
  const result =
    hValues.length > 4
      ? {
          success: true,
          message: "Read",
          data: { headers: hValues, values: values },
        }
      : { success: false, message: "Not enough data in the sheet", data: null };
  return result;
}

//taking doc <GoogleSpreadsheet>, selected program index and req.body (with values) to add workout to the spreadsheet
export async function readValuesAndUpdateDoc(doc, selected, body) {
  const sheets = doc.sheetsByIndex;
  const sheetTitles = sheets.map((item) => item.title);

  const programIndex = sheetTitles.indexOf(selected);

  const sheet = doc.sheetsByIndex[programIndex];
  await sheet.loadCells();

  const values = [...body]; //reading new values and writing them to the new row
  let valStatus = validateValues(values);

  console.log("API valStatus: ");
  console.log(valStatus);

  if (valStatus.value) {
    const dimensions = { startIndex: 1, endIndex: 2 }; //selecting the first row for inserting
    await sheet.insertDimension("ROWS", dimensions, true); //insert a row in the beginning and getting new rows
    const rows = await sheet.getRows();

    const options = { raw: false, insert: false, index: 0 };
    await sheet.addRow(valStatus.newValues, options);

    //updating data and sheet
    await sheet.saveUpdatedCells();

    return { success: true, message: "Added" };
  } else {
    return { success: false, message: valStatus.message };
  }
}

//taking mysql db, selected program index and req.body (with values) to add workout to the DB
export async function readValuesAndUpdateDB(db, selected, body) {
  const sheets = doc.sheetsByIndex;
  const sheetTitles = sheets.map((item) => item.title);

  const programIndex = sheetTitles.indexOf(selected);

  const sheet = doc.sheetsByIndex[programIndex];
  await sheet.loadCells();

  const values = [...body]; //reading new values and writing them to the new row
  let valStatus = validateValues(values);

  console.log("API valStatus: ");
  console.log(valStatus);

  if (valStatus.value) {
    const dimensions = { startIndex: 1, endIndex: 2 }; //selecting the first row for inserting
    await sheet.insertDimension("ROWS", dimensions, true); //insert a row in the beginning and getting new rows
    const rows = await sheet.getRows();

    const options = { raw: false, insert: false, index: 0 };
    await sheet.addRow(valStatus.newValues, options);

    //updating data and sheet
    await sheet.saveUpdatedCells();

    return { success: true, message: "Added" };
  } else {
    return { success: false, message: valStatus.message };
  }
}

export async function getProgramSettingsfromDB(db, dataObject) {
  const getProgramIDQuery = `SELECT * FROM programs WHERE name = '${dataObject.program}'`;
  const result = await db.query(getProgramIDQuery);
  const programID = result[0][0];
  console.log(`program id: ${programID.id}`);
  return programID;
}

export async function getProgramDataFromDB(db, dataObject) {
  const programData = [];

  const exercisesNum = Object.keys(dataObject).length;
  console.log(`--dataobject`, dataObject);

  for (let i = 4; i < exercisesNum; i++) {
    const exerciseName = Object.keys(dataObject)[i];
    console.log(`--`, exerciseName);
    const getExerciseIDQuery = `SELECT id FROM exercises WHERE name = '${exerciseName}'`;
    let result = await db.query(getExerciseIDQuery);
    const exerciseID = result[0][0].id;
    const exerciseData = {
      exercise_id: exerciseID,
      workload: dataObject[exerciseName],
    };
    programData.push(exerciseData);
  }
  return programData;
}

export async function insertWorkoutToDB(
  programID,
  programData,
  dataObject,
  db
) {
  const dbQuery = `INSERT INTO workouts(program, program_data, date) VALUES (${programID},'${JSON.stringify(
    programData
  )}', STR_TO_DATE('${dataObject["Date"]}',"%m/%d/%Y"))`;
  await db.query(dbQuery);
}

export async function copyAllTrainingDataFromDocToDB(doc, db) {
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
        return row;
      });
      const sheetObj = { program: theSheet.title, data: sheetData };
      docData.push(sheetObj);
    }

    for (const programSheet of docData) {
      //getting data ready for workouts table
      //getting program id from programs table
      const programID = await getProgramSettingsfromDB(db, programSheet);

      for (const theWorkout of programSheet.data) {
        //getting exercises list from exercises table
        const programData = await getProgramDataFromDB(db, theWorkout);
        //insert workout into the table
        await insertWorkoutToDB(programID.id, programData, theWorkout, db);
      }
    }
    return { status: "Import: success" };
  } catch (err) {
    throw new Error(err);
  }
}

export async function createNewWorkoutForDB(db, selected, validatedValues) {
  const selectedProgramDefaults = await getProgramSettingsfromDB(db, {
    program: selected,
  });
  //console.log(`selectedProgramDefaults: `, selectedProgramDefaults);
  const newWorkoutForDB = {
    program: selectedProgramDefaults.id,
    comment: null,
    date: validatedValues[1],
    programSettings: {
      rest: validatedValues[3],
      sets: +validatedValues[2].split("x")[0],
      reps: +validatedValues[2].split("x")[1],
    },
  };

  let receivedExercisesNames = [];
  for (let i = 4; i < validatedValues.length; i++) {
    receivedExercisesNames.push(`'${validatedValues[i].name}'`);
  }
  const exerciseQuery = `SELECT id, name FROM exercises WHERE name IN (${receivedExercisesNames.join(
    ", "
  )})`;
  const result = await db.query(exerciseQuery);
  const exerciseNames = result[0].reduce((acc, item) => {
    acc[item.name] = item.id;
    return acc;
  }, {});

  const programData = [];
  for (let i = 4; i < validatedValues.length; i++) {
    const exercise = {};
    exercise.workload = validatedValues[i].workload;
    exercise.exercise_id = exerciseNames[validatedValues[i].name];
    programData.push(exercise);
  }
  newWorkoutForDB.programData = programData;
  return newWorkoutForDB;
}

export async function insertNewWorkoutToDB(db, newWorkoutForDB) {
  try {
    let insertNewWorkoutQuery = `INSERT INTO workouts(program, program_data, comment, date, program_settings) VALUES (`;
    insertNewWorkoutQuery += `${newWorkoutForDB.program}, `;
    insertNewWorkoutQuery += `'${JSON.stringify(
      newWorkoutForDB.programData
    )}', `;
    insertNewWorkoutQuery += `${newWorkoutForDB.comment}, `;
    insertNewWorkoutQuery += `STR_TO_DATE('${newWorkoutForDB.date}',"%Y-%m-%d"), `;
    insertNewWorkoutQuery += `'${JSON.stringify(
      newWorkoutForDB.programSettings
    )}')`;
    //console.log(insertNewWorkoutQuery);
    const resq = await db.query(insertNewWorkoutQuery);
    return {
      success: true,
      message: "New workout successfully added to the DB",
      error: null,
      result: resq,
    };
  } catch (err) {
    return {
      success: false,
      message: "Query error (inserting new workout to the DB)",
      error: err,
      result: resq,
    };
  }
}

export async function getNewestSelectedWorkoutFromDB(db, selected) {
  //for the program with <selected> program name we're getting:
  // • headers (e.g.):  [id, Date,      Reps, Rest (sec), Squat,  Static lunge, Barbell row,  Barbell press,  Running]
  // • values (e.g.):   [27, 8/6/2024,  2x5,  120,        120,    60,	          65,           90,             5]
  // and returning them
  const readAttempt = { success: false };

  try {
    //getting default program settings (sets, reps, rest)
    const programSettings = await getProgramSettingsfromDB(db, {
      program: selected,
    });
    //getting exercises list from the last actual workout with this program
    const getProgramIDQuery = `SELECT * FROM workouts WHERE program = ${programSettings.id} ORDER BY date DESC LIMIT 1`;
    const result = await db.query(getProgramIDQuery);
    const newestWorkout = result[0][0];

    //filling data in
    const data = {};
    data.headers = ["id", "Date", "Reps", "Rest (sec)"];

    const workoutDate = new Date(newestWorkout.date).toLocaleDateString(
      "fr-ca"
    );
    data.values = [
      newestWorkout.id,
      workoutDate,
      `${programSettings.sets}x${programSettings.reps}`,
      programSettings.rest,
    ];

    //transforming id-s to names
    for (const exercise of newestWorkout.program_data) {
      const getProgramIDQuery = `SELECT name FROM exercises WHERE id = ${exercise.exercise_id}`;
      const result = await db.query(getProgramIDQuery);
      const exercise_name = result[0][0].name;
      data.headers.push(exercise_name);
      data.values.push(+exercise.workload);
    }
    readAttempt.success = true;
    readAttempt.data = data;
  } catch (error) {
    readAttempt.success = false;
    readAttempt.data = data;
    console.log("API: Reading error:", readAttempt.data);
  } finally {
    return readAttempt;
  }
}
