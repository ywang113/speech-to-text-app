const audioConvertPromises = require('../helper/audioConvertPromise').speech2TextPromise

exports.convert = function(req,res){

    const gcsFiles = []
    let gcsUris = [];
    const promises = []; 

    /**
     * Get Uploaded files from Client, Store them in gcsFiles
     */
    req.files.forEach( file => gcsFiles.push({
      filename:file.filename,
      path:file.path
    }))
  
    /*
      Generate Bucket Uris. Uri is param used in configuration of Speech2Text Api
    */
    gcsFiles.forEach(file => {gcsUris.push(`gs://speech2textaudiofiles/${file.filename}`)});

    /**
     * unshift each promise that returned from aduioConvertPromises into an array
     */
    for(let i = 0 ; i < gcsFiles.length; i++){
        promises.unshift(audioConvertPromises(gcsFiles[i]))
    };
  
    Promise.all(promises).then((values)=>{
      res.send(values);
      gcsFiles.length = 0;
    });
}