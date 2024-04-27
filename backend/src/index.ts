import express from 'express';
import cors from 'cors';

import multer from 'multer';
import csvToJson from 'convert-csv-to-json'

const storage = multer.memoryStorage();
const upload = multer({
  storage
});

const port = process.env.PORT ?? 3000;
const app = express();
app.use(cors());
app.use(express.json());

let userData: Array<Record<string, string>> = []

app.post('/api/files', upload.single('file'), async (req, res) => {
  //1. Extract file from request
  const { file } = req;
  //2. Validate that we have file
  if (!file) {
    return res.status(500).json({
      message: 'No file uploaded'
    })
  }
  //3. Valide he mimetype (csv)
  if (file.mimetype !== 'text/csv') {
    return res.status(500).json({
      message: 'Invalid file type'
    })
  }
  //4. Transform the File (Buffer) to String
  try {
    const rawCsv = Buffer.from(file.buffer).toString('utf-8');
    console.log(rawCsv);
    //5. Transform the String to JSON
    const json = csvToJson.fieldDelimiter(',').csvStringToJson(rawCsv);
    //6. Save the JSON to db (or memory)
    userData = json;
    //7. Return 200 with the message and the JSON
    return res.status(200).json({
      data: json,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error processing the file'
    })
  }
});

app.get('/api/users', (req, res) => {
  //1. Extract the query params 'q' from the request
  const { q } = req.query;
  //2. Validate that we have the query param
  if (!q) {
    return res.status(500).json({
      message: 'Query param "q" is required'
    })
  }

  if (Array.isArray(q)) {
    return res.status(500).json({
      message: 'Query param "q" is required'
    })
  }
  //3. Filter the data from the db (or memory) with the query param
  const search = q.toString().toLowerCase()

  const filteredData = userData.filter((row) => {
    return Object.values(row).some((value) => {
      return value.toString().toLowerCase().includes(search)
    })
  })
  //4. Return 200 with the filtered data
  return res.status(200).json({
    data: filteredData
  })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});