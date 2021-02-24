const express = require('express')
const multer = require('multer')
const cors = require('cors')
const MulterGCS = require('multer-google-storage')


const GCSfiles = [] // storage files that been uploaded to GCS

const app = express()
app.use(cors())


/**
 * Customized Functions 
*/
const uploadHandler = multer({
  storage: new MulterGCS.storageEngine({
    keyFilename: './BucketAPIKEY.json',
    projectId: 'speech-to-text-305005',
    bucket:'speech2textaudiofiles',
    filename : function(req,file,cb){
      cb(null,`${file.originalname}`);
    }
  })
})



/**
 * Routers
 */
app.post('/upload',uploadHandler.any(), function(req, res) {
  const files = req.files
  files.forEach(file => {
    const {filename,path} = file
    GCSfiles.push({
      filename:filename,
      path:path
    })
  })
  // send uploaded files data to the client
  res.send(GCSfiles)
});

app.post('/convert', function(req, res) {
  const resBody = []

  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient({
    keyFilename:'./BucketAPIKEY.json'
  });

  let gcsUris = []
  GCSfiles.forEach(file => {gcsUris.push(`gs://speech2textaudiofiles/${file.filename}`)})

  // async function quickstart(file) {
  //   // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  //   const audio = {
  //     uri: `gs://speech2textaudiofiles/${file.filename}`
  //   };
  //   const config = {
  //     encoding: 'LINEAR16',
  //     sampleRateHertz: 44100,
  //     languageCode: 'en-US',
  //   };
  //   const request = {
  //     audio: audio,
  //     config: config,
  //   };
  //   // Detects speech in the audio file
  //   const [operation] = await client.longRunningRecognize(request);
  //   const [response] = await operation.promise()
  //   const transcription = response.results
  //     .map(result => result.alternatives[0].transcript)  //result => result.alternatives[0].transcript
  //     .join('\n');
  //   const confidence = response.results[0].alternatives[0].confidence
  //   resBody.push({
  //                 filename: file.filename,
  //                 transcription: transcription,
  //                 confidence : confidence
  //               })
  //   console.log(resBody)
  //   transcription.push
  //   GCSfiles.length = 0
  // }

  function speech2TextPromise(file) {
    return new Promise(async(resolve, reject) => {
    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
      const audio = {
        uri: `gs://speech2textaudiofiles/${file.filename}`
      };
      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'en-US',
      };
      const request = {
        audio: audio,
        config: config,
      };
      // Detects speech in the audio file
      const [operation] = await client.longRunningRecognize(request);
      const [response] = await operation.promise()
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)  //result => result.alternatives[0].transcript
        .join('\n');
      const confidence = response.results[0].alternatives[0].confidence
      resBody.push({
                    filename: file.filename,
                    transcription: transcription,
                    confidence : confidence
                  })
      GCSfiles.length = 0
      resolve("success")
    })
  }

  const promiseArray = []
    for(let i = 0 ; i < GCSfiles.length; i++){
      promiseArray.unshift(speech2TextPromise(GCSfiles[i]))
    }

  Promise.all(promiseArray).then(()=>{
    res.send(resBody)
  })

  
  // res.send(resBody)



  /**
   * TODO: Delete files on the bucket once this transcription finish
   *       front-end UI
   *       handle mutlipule files upload
   */
});



app.listen(8000, function(gcsUris) {

    console.log('App running on port 8000');

})