const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Object,
  },
}, {
  collection: 'fs.files'
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
