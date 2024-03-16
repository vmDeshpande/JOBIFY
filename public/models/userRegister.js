const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    contact: String,
    email: String,
    dob: String,
    country: String,
    state: String,
    city: String,
    last_qualification: String,
    idProof: String,
    aadhar_number: String,
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
        expectedSalary: String,
        date: { type: Date, default: Date.now },
        approved: { type: String, default: "pending" },
        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resume',
        },
    }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
