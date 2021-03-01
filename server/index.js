const express = require('express');

const cors = require('cors');

const uploadHandler = require('./helper/123').uploadHandler
const uploadRouter = require('./router/upload').uploadRouter

// storage files that been uploaded to GCS
const app = express();

app.use(cors());

/**
 * Customized Functions 
*/


/**
 * Routers
 * 1. 函数封装
 * 2. 单独的文件放所有出现的string，除了log类的
 */
app.post('/upload',uploadHandler.any(), async (req,res) =>{ await uploadHandler(req,res) });

app.post('/convert', uploadHandler.any(), async function(req, res) {
  console.log(req.files)
  const GCSfiles = []
  req.files.forEach( file => GCSfiles.push({
    filename:file.filename,
    path:file.path
  }))
  const resBody = [];
  const speech = require('@google-cloud/speech');

  // Creates a Google Speech client
  const client = new speech.SpeechClient({
    keyFilename:'./BucketAPIKEY.json'
  });

  /*
    Get Bucket Uris. Uri is param used in configuration of Speech2Text Api
  */
  let gcsUris = [];
  GCSfiles.forEach(file => {gcsUris.push(`gs://speech2textaudiofiles/${file.filename}`)});

  function speech2TextPromise(file) {
    return new Promise( async (resolve, reject) => {

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
      const audio = {
        uri: `gs://speech2textaudiofiles/${file.filename}`
      };

      const config = {
        encoding: 'LINEAR16',
        languageCode: 'en-US',
      };

      const request = {
        audio: audio,
        config: config,
      };

      // Detects speech in the audio file
      const [operation] = await client.longRunningRecognize(request);
      const [response] = await operation.promise();
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)  //result => result.alternatives[0].transcript
        .join('\n');
      const confidence = response.results[0].alternatives[0].confidence

      resBody.push({
                    filename: file.filename,
                    transcription: transcription,
                    confidence : confidence
                  });

      //Clear Cache
      GCSfiles.length = 0;
      resolve("success");
    })
  }

  const promises = [];
  for(let i = 0 ; i < GCSfiles.length; i++){
      promises.unshift(speech2TextPromise(GCSfiles[i]))
  };

  Promise.all(promises).then(()=>{
    res.send(resBody);
  });
});

/*
  
*/
app.listen(8000, ()=>{
  console.log('app running on port 8000')
})