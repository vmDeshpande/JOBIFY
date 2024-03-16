const express = require('express');
const router = express.Router();
const Resume = require('../models/resume');

router.get('/resume', async (req, res) => {
    const { resumeId } = req.query;

    try {
        const resume = await Resume.findById(resumeId);

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.setHeader('Content-Type', resume.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${resume.fileName}`);

        res.send({
            fileName: resume.fileName,
            fileData: resume.data.toString('base64'),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching resume data', error: error.message });
    }
});

module.exports = router;
