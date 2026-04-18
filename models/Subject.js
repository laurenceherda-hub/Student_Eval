const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    lec: { type: Number, default: 0 },
    lab: { type: Number, default: 0 },
    units: { type: Number, required: true },
    year: { type: mongoose.Mixed, required: true }, // 1,2,3,4
    sem: { type: mongoose.Mixed, required: true },  // 1,2,'summer'
    prerequisites: [{ type: String, uppercase: true }]
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
