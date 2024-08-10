const { GoogleSpreadsheet } = require("google-spreadsheet");

import { readValuesAndUpdateDoc, readSelectedProgram } from "@/components/functions";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const sheetId = process.env.GOOGLE_SHEET_ID;

const jwtFromEnv = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: SCOPES,
});

export default async function handler(req, res) {
  try {
    const doc = new GoogleSpreadsheet(sheetId, jwtFromEnv);
    await doc.loadInfo(); // loads document properties and worksheets

    // ***** POST *****
    // ****************
    if (req.method == "POST") {
      const {
        query: { selected },
      } = req;

      const updateAttempt = await readValuesAndUpdateDoc(
        doc,
        selected,
        req.body
      );

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
        //if it's an initial request (fetched = 0)
        const sheets = doc.sheetsByIndex;
        const sheetTitles = sheets.map((item) => item.title);

        res.status(200).json({ titles: sheetTitles });
      } else if (selected) {
        //if it's an actual data request
        const readAttempt = await readSelectedProgram(doc, selected);
        if (readAttempt.success) {
          res.status(200).json({
            headers: readAttempt.data.headers,
            values: readAttempt.data.values,
          });
        } else {
          res.status(500).end("Not enough data in the sheet");
        }
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


