const multer = require('multer');
const MulterGCS = require('multer-google-storage');

exports.uploadHandler = multer({
    storage: new MulterGCS.storageEngine({
        keyFilename: './BucketAPIKEY.json',
        projectId: 'speech-to-text-305005',
        bucket: 'speech2textaudiofiles',
        filename: function (req, file, cb) {
            cb(null, `${file.originalname}`);
        }
    })
});