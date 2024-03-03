const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    username: String,
    password: String,
    companyName: String
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
