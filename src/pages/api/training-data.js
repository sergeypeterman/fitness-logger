const { GoogleSpreadsheet } = require("google-spreadsheet");
const sheetId = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(sheetId);
import { checkIntegerRange, checkDate } from "@/components/functions";

export default async function handler(req, res) {
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    let sheets = [];
    let sheetTitles = [];
    let sheet;
    let values = [];
    let rows; //getting rows

    //if fetching with post == true , validate the data and update the sheet
    if (req.method == "POST") {
      const {
        query: { selected },
      } = req;

      sheets = doc.sheetsByIndex;
      sheetTitles = sheets.map((item) => item.title);

      const programIndex = sheetTitles.indexOf(selected);

      console.log(sheetTitles);
      console.log(`${selected} ' index = ${programIndex}`);

      sheet = doc.sheetsByIndex[programIndex];
      await sheet.loadCells();

      values = [...req.body]; //reading new values and writing them to the new row
      let valStatus = validateValues(values);

      console.log("API valStatus: ");
      console.log(valStatus);

      if (valStatus.value) {
        const dimensions = { startIndex: 1, endIndex: 2 }; //selecting the first row for inserting
        await sheet.insertDimension("ROWS", dimensions, true); //insert a row in the beginning and getting new rows
        rows = await sheet.getRows();

        const options = { raw: false, insert: false, index: 0 };
        await sheet.addRow(valStatus.newValues, options);

        //updating data and sheet
        await sheet.saveUpdatedCells();
        res.status(200).json({ message: "Added" });
      } else {
        res.status(405).end(`${valStatus.message}`);
      }
    } else if (req.method == "GET") {
      const {
        query: { selected },
      } = req;

      //reading encoded word 'initial'
      const isInitial = Buffer.from("initial").toString("base64");

      if (selected == isInitial) {
        //if it's an initial request (fetched = 0)
        sheets = doc.sheetsByIndex;
        sheetTitles = sheets.map((item) => item.title);

        res.status(200).json({ titles: sheetTitles });
      } else if (selected) {
        //if it's an actual data request
        sheets = doc.sheetsByIndex;
        sheetTitles = sheets.map((item) => item.title);

        const programIndex = sheetTitles.indexOf(selected);

        console.log(sheetTitles);
        console.log(`${selected} ' index = ${programIndex}`);

        sheet = doc.sheetsByIndex[programIndex];

        await sheet.loadCells();
        rows = await sheet.getRows();
        //is it a first workout in the sheet? if yes, fill values with 0-s
        if (rows.length) {
          values = [...rows[0]._rawData]; //getting values
        } else {
          sheet.headerValues.map((item, ind) => (values[ind] = 0));
        }
        //sending headers and corresponding values
        res.status(200).json({ headers: sheet.headerValues, values: values });
      } else {
        res.status(405).end(`Unknown Program selected`);
      }
    } else {
      res.status(405).end(`${req.method} Not Allowed`);
    }
  } catch (err) {
    console.log("error api " + err);
    res.status(500).json(err);
  }
}

function validateValues(values) {
  //checking structure and normalizing type:
  //id	Date	Reps	Rest (sec)	[num, date, NumxNum, num]
  //exercises: [num]

  let message = "";
  let newValues = [...values];

  console.log(values);
  let result = values.reduce((res, item, ind) => {
    let inRange;

    console.log(`Reduce, ind = ${ind} item = ${item} result = ${res}`);

    if (ind === 0) {
      //id
      newValues[ind] = Number(item);
      inRange = checkIntegerRange(newValues[ind], 0, 500000); // 5.000.000 cells / 10 columns
      return res && inRange.intInRange;
    } else if (ind === 1) {
      //date
      inRange = checkDate(item, 7);
      inRange.dateInRange = inRange.dateInRange === true ? true : false;
      return res && inRange.dateInRange;
    } else if (ind === 2) {
      //reps
      let repsArr = item.split("x");
      inRange = checkIntegerRange(Number(repsArr[0]), 0, 99);
      if (inRange.intInRange) {
        inRange = checkIntegerRange(Number(repsArr[1]), 0, 999);
        return res && inRange.intInRange;
      } else {
        return false;
      }
    } else {
      //exercises and rest
      newValues[ind] = Number(item);
      inRange = checkIntegerRange(newValues[ind], 0, 999);
      return res && inRange.intInRange;
    }
  }, true);
  console.log(newValues);
  message = result ? "API: correct data" : "API: wrong data input";
  return { value: result, message: message, newValues: newValues };
}
