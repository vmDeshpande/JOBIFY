const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    experience: String,
    phone_number: String
});

const jobSchema = new mongoose.Schema({
    title: String,
    location: String,
    contact: String,
    salary: Number,
    job_type: String,
    applications: [applicationSchema],
});

const companyPostsSchema = new mongoose.Schema({
    companyName: String,
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    jobs: [jobSchema],
});

const CompanyPost = mongoose.model('CompanyPosts', companyPostsSchema);

module.exports = CompanyPost;
