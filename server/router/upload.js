

exports.uploadRouter = function(req, res){
    const GCSfiles = [];
    const files = req.files;
    console.log("123")
    files.forEach(file => {
      const {filename,path} = file;
      GCSfiles.push({
        filename:filename,
        path:path
      })
    });
  
    // send uploaded files data to the client
    res.send(GCSfiles);

  }