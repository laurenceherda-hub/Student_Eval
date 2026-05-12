require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const prospectusData = require('./models/prospectusData');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        await Subject.deleteMany({});
        console.log('🗑️  Cleared existing subjects');

        const inserted = await Subject.insertMany(prospectusData);
        console.log(`✅ Seeded ${inserted.length} subjects into the prospectus`);

        await mongoose.disconnect();
        console.log('👋 Done!');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();
