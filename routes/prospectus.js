const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET all prospectus subjects
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ year: 1, sem: 1 });
        res.json({ success: true, data: subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET subjects by year
router.get('/year/:year', async (req, res) => {
    try {
        const subjects = await Subject.find({ year: parseInt(req.params.year) }).sort({ sem: 1 });
        res.json({ success: true, data: subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
