

exports.speech2TextPromise = function(file){

  return new Promise( async (resolve, reject) => {

    // inilization
    const speech = require('@google-cloud/speech'); 
    const client = new speech.SpeechClient({
      keyFilename:'BucketAPIKEY.json'
    });
    
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

    /**
     * Save response from Google API into resolve 
     */
    let resBody = {
                  filename: file.filename,
                  transcription: transcription,
                  confidence : confidence
                };

    resolve(resBody);
  })
}