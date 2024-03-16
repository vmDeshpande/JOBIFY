const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    username: String,
    companyName: String,
    contact: String,
    email: String,
    website: String,
    password: String,
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
