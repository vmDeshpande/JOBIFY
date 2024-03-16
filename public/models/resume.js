// resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  fileName: String,
  data: Buffer,
  contentType: String,
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
