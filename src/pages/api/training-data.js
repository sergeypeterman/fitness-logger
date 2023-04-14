const { GoogleSpreadsheet } = require('google-spreadsheet');
const sheetId = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(sheetId);

export default async function handler(req, res) {

  try
  {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; 
    let rows = await sheet.getRows(); //getting rows
    let values = rows[0]._rawData; //getting values

    await sheet.loadCells();
    //if fetching with post == true , update the sheet
    if(req.method === 'POST'){
      console.log(`BODY TYPE: ${typeof req.body}: ${req.body}`);

      const dimensions = {startIndex:1, endIndex:2};
      sheet.insertDimension('ROWS', dimensions, true);//insert a row in the beginning and getting new rows
      rows = await sheet.getRows(); 

      values = [...req.body];//reading new values and writing them to the new row
      const options = {raw:false, insert: false, index: 0};
      sheet.addRow(values, options);
      
      
      //updating data and sheet
      await sheet.saveUpdatedCells();
      rows = await sheet.getRows();
      values = rows[0]._rawData;
    }

    //sending headers and corresponding values
    res.status(200).json({ headers: sheet.headerValues, values: values })
  }
  catch(err){
    console.log("error api " + err);
    res.status(500).json(err)
  }
}
