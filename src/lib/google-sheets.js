
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Initialize the sheets client
export const getGoogleSheet = async () => {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
    throw new Error('Google Sheets credentials or Spreadsheet ID are missing in environment variables.');
  }

  const auth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);
  await doc.loadInfo();
  return doc;
};

export const appendToSheet = async (data, sheetTitle) => {
  try {
    const doc = await getGoogleSheet();
    let sheet = doc.sheetsByTitle[sheetTitle];

    // If the sheet doesn't exist, create it with the headers from the data keys
    if (!sheet) {
      const headers = Object.keys(data);
      sheet = await doc.addSheet({ title: sheetTitle, headerValues: headers });
    }

    await sheet.addRow({
      ...data,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error appending to Google Sheet:', error);
    return { success: false, error: error.message };
  }
};
