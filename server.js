require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/prospectus', require('./routes/prospectus'));
app.use('/api/students', require('./routes/students'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback: serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB:', process.env.MONGODB_URI);
        
        // Auto-seed prospectus if empty
        const Subject = require('./models/Subject');
        const prospectusData = require('./models/prospectusData');
        try {
            const count = await Subject.countDocuments();
            if (count === 0) {
                console.log('🌱 Prospectus is empty. Auto-seeding...');
                await Subject.insertMany(prospectusData);
                console.log(`✅ successfully seeded ${prospectusData.length} subjects.`);
            }
        } catch (err) {
            console.error('❌ Auto-seeding failed:', err.message);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Make sure MongoDB is running. Start it with: mongod');
        process.exit(1);
    });
