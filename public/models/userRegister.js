const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    applications: [{
        jobTitle: String,
        companyName: String,
        fullName: String,
        email: String,
        contact: String,
        experience: String,
        phone_number: String,
        job_type: String,
        date: { type: Date, default: Date.now },
        approved: { type: String, default: "pending" },
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
