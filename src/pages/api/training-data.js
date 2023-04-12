const { GoogleSpreadsheet } = require('google-spreadsheet');
const sheetId = process.env.GOOGLE_SHEET_ID;
const doc = new GoogleSpreadsheet(sheetId);

export default async function handler(req, res) {
  const {query: {post}, 
        } = req;

  try
  {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo(); // loads document properties and worksheets
    const title = doc.title;
    const sheet = doc.sheetsByIndex[0]; 
    let rows = await sheet.getRows(); //getting rows
    let values = rows[0]._rawData; //getting values

    await sheet.loadCells();

    const DAY = 1000*60*60*24;

    //if fetching with post == true , update the sheet
    if(post){
      values.map((item, ind)=>{
        sheet.getCell(1,ind).value = item;
      });
      
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
