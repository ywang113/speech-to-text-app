const express = require('express');

const cors = require('cors');

const uploadHandler = require('./helper/uploadHandler').uploadHandler
const uploadRouter = require('./router/upload').uploadRouter
const audioConvertPromises = require('./helper/audioConvertPromise').speech2TextPromise

// storage files that been uploaded to GCS
const app = express();

app.use(cors());

app.post('/upload',uploadHandler.any(), async (req,res) => {uploadRouter(req,res)} );


/**
 * TODO: cb function encapsulation
 */
app.post('/convert', uploadHandler.any(), async function(req, res) {

  const GCSfiles = []
  req.files.forEach( file => GCSfiles.push({
    filename:file.filename,
    path:file.path
  }))

  // Creates a Google Speech client

  /*
    Get Bucket Uris. Uri is param used in configuration of Speech2Text Api
  */
  let gcsUris = [];
  GCSfiles.forEach(file => {gcsUris.push(`gs://speech2textaudiofiles/${file.filename}`)});

  const promises = [];
  for(let i = 0 ; i < GCSfiles.length; i++){
      promises.unshift(audioConvertPromises(GCSfiles[i]))
  };

  Promise.all(promises).then((values)=>{
    console.log(values)
    res.send(values);
    GCSfiles.length = 0;
  });
});


app.listen(8000, ()=>{
  console.log('app running on port 8000')
})