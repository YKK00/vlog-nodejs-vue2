const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const mongoose = require('mongoose');
const path = require('path');
const Grid = require('gridfs-stream');

// Create storage engine
const storage = new GridFsStorage({
  url: 'mongodb://localhost:27017/blog',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });

// @route POST /upload
// @desc  Uploads file to DB
router.post('/', upload.single('file'), (req, res) => {
  res.status(200).send({file: req.file})
});

// Initialize GridFS
let gfs;
mongoose.connection.once('open', () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection('uploads');
});

// @route GET /files/:filename
// @desc  Display file
router.get('/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file exists
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }
    // Check if file is image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: 'Not an image' });
    }
  });
});

module.exports = router;
