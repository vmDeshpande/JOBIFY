const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(64).toString('hex');
console.log(secretKey)

const app = express();
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
}));
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

try {
    mongoose.connect('mongodb+srv://admin:admin123@cluster0.yqeyney.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Database Connected")
    
} catch (error) {
    console.error(error.message);
}
const db = mongoose.connection;

const User = require('../models/userRegister');
const Company = require('../models/companyRegister');
const CompanyPost = require('../models/CompanyPost');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());
app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

app.post('/register/user', async (req, res) => {
    const { username, password } = req.body;

    try {
        const newUser = new User({
            username,
            password,
            applications: [],
        });

        await newUser.save();
        res.json({ message: 'User registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});



app.post('/register/company', async (req, res) => {
    const { username, password, companyName } = req.body;

    try {
        const newCompany = new Company({ username, password, companyName});
        await newCompany.save();
        res.json({ message: 'Company registration successful' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.get('/check-auth-status', (req, res) => {
    const isAuthenticated = req.session.user || req.session.company;

    const isCompany = req.session.company !== undefined;
    const isUser = req.session.user !== undefined;

    res.json({ isAuthenticated, isCompany, isUser });
});
app.post('/login/user', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            req.session.user = user;
            res.json({ message: 'User login successful' });

        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

app.post('/login/company', async (req, res) => {
    const { username, password } = req.body;

    try {
        const company = await Company.findOne({ username, password });
        if (company) {
            req.session.company = company;

            // Store the company name in the session
            req.session.companyName = company.companyName.toLowerCase();

            res.json({ message: 'Company login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ message: 'Logout failed' });
        } else {
            res.json({ message: 'Logout successful' });
        }
    });
});
app.post('/post', async (req, res) => {
    if (!req.session.company) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { jobType, jobTitle, companyName, location, contact, salary } = req.body;

    try {
        const existingPost = await CompanyPost.findOne({ companyName: companyName });

        if (existingPost) {
            existingPost.jobs.push({ title: jobTitle, location, contact, salary, job_type: jobType });
            await existingPost.save();
            res.json({ message: 'Job post updated successfully' });
        } else {
            const newPost = new CompanyPost({
                companyName: companyName,
                companyId: req.session.company._id,
                jobs: [{ title: jobTitle, location, contact, salary, job_type: jobType }],
            });

            await newPost.save();
            res.json({ message: 'Job post created successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Job post creation/update failed', error: error.message });
    }
});

app.get('/get-job-listings', async (req, res) => {
    try {
        const jobListings = await CompanyPost.find().populate('companyId', 'companyName');

        res.json(jobListings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching job listings', error: error.message });
    }
});

app.post('/apply-for-job', async (req, res) => {
    const { email, companyName, jobTitle, experience, phone_number, job_type } = req.body;

    const userName = req.session.user.username
    try {
        const newApplication = {
            fullName: userName,
            email: email,
            experience: experience,
            phone_number: phone_number,
        };

        const updatedCompanyPost = await CompanyPost.findOneAndUpdate(
            { "companyName": companyName, "jobs.title": jobTitle },
            { $push: { "jobs.$.applications": newApplication } },
            { new: true }
        );

        if (!updatedCompanyPost) {
            return res.status(404).json({ message: 'No matching document found for update' });
        }
        const contactN = await CompanyPost.findOne(
            { "companyName": companyName, "jobs.title": jobTitle }
        );
        
        const contactValue = contactN.jobs[0].contact;
        
        const application = {
            jobTitle: jobTitle,
            companyName: companyName,
            fullName: userName,
            email: email,
            contact: contactValue,
            experience: experience,
            phone_number: phone_number,
            job_type: job_type
        }
        const updatedUser = await User.findOneAndUpdate(
            { username: userName },
            { $push: { applications: application } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'No matching user found for update' });
        }

        res.json({ message: 'Application submitted successfully', updatedCompanyPost, updatedUser });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});


app.get('/get-applications', async (req, res) => {
    const companyName = req.query.companyName;

    try {
        const companyPost = await CompanyPost.findOne({ companyName });

        if (!companyPost) {
            return res.status(404).json({ message: 'Company not found or no applications available' });
        }

        const applications = companyPost.jobs.flatMap(job => 
            job.applications.map(application => ({
                jobTitle: job.title,
                ...application._doc
            }))
        );

        res.json(applications);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

app.get('/panel', async (req, res) => {
    try {
        if (!req.session.company) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const companyName = req.session.companyName;

        const companyPosts = await CompanyPost.findOne({ companyName }).populate('companyId', 'companyName');
        if(companyPosts) {
        const applications = companyPosts.jobs.flatMap(job =>
            job.applications.map(application => ({
                jobTitle: job.title,
                ...application._doc
            }))
        );
        res.json({ companyName, companyPosts, applications });
        } else {
            res.json({ companyName, companyPosts });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching company posts and applications', error: error.message });
    }
});

app.get('/user-panel', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = req.session.user.username;

        // Fetch user data
        const userData = await User.findOne({username: user});

        // Extract applications array from user data
        const applications = userData.applications || [];

        res.json({ userData, applications });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching user data and applications', error: error.message });
    }
});

app.post('/approve-application', async (req, res) => {
    const { applicantName, isHired, jobTitle } = req.body;

    try {
        // Assuming you have a model named 'Application' for your applications
        const updatedApplication = await User.findOneAndUpdate(
            { username: applicantName, 'applications.jobTitle': jobTitle },
            { $set: { 'applications.$.approved': isHired ? 'true' : 'false' } },
            { new: true }
        );

        if (!updatedApplication) {
            return res.status(404).json({ message: 'No matching document found for update' });
        }
        if (!isHired) {
            await CompanyPost.findOneAndUpdate(
                { 'jobs.applications.fullName': applicantName, 'jobs.title': jobTitle },
                { $pull: { 'jobs.$.applications': { fullName: applicantName } } }
            );
        } else {
            // Remove the entire job entry from CompanyPost if it's marked as hired
            await CompanyPost.findOneAndUpdate(
                { 'jobs.title': jobTitle },
                { $pull: { jobs: { title: jobTitle } } }
            );
        }

        res.json({ message: 'Application status updated successfully', updatedApplication });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
