const { GoogleSpreadsheet } = require("google-spreadsheet");
const sheetId = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(sheetId);
import {
  validateValues,
  checkIntegerRange,
  checkDate,
} from "@/components/functions";

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

      /*console.log(sheetTitles);
      console.log(`${selected} ' index = ${programIndex}`);*/

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
        res.status(400).end(`${valStatus.message}`);
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

        /*console.log(sheetTitles);
        console.log(`${selected} ' index = ${programIndex}`);*/

        sheet = doc.sheetsByIndex[programIndex];

        await sheet.loadCells();
        rows = await sheet.getRows();
        //is it a first workout in the sheet? if yes, fill values with 0-s
        if (rows.length) {
          values = [...rows[0]._rawData]; //getting values
        } else {
          sheet.headerValues.map((item, ind) => (values[ind] = 0));
        }
        //sending headers and corresponding values, if there are >4 headers
        // if <= 4 headers, error, there are no exercises
        let hValues = [...sheet.headerValues];

        hValues.length > 4
          ? res.status(200).json({ headers: hValues, values: values })
          : res.status(500).end("Not enough data in the sheet");
      } else {
        res.status(400).end(`Unknown Program selected`);
      }
    } else {
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
