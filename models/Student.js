const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    subjectCode: { type: String, required: true, uppercase: true },
    subjectName: { type: String },
    // Special values: 7 = DROPPED, 8 = INC (Incomplete), 9 = NT (No Test/Exam)
    // Grades 3.1–5.0 stored as 5.0 (FAILED). Normal range: 1.0–3.0
    gwa: { type: Number, required: true, min: 1.0, max: 9.0 },
    schoolYear: { type: String, default: '' },
    units: { type: Number, default: 3 },
    lec: { type: Number, default: 0 },
    lab: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    status: { type: String, enum: ['PASSED', 'FAILED', 'INC', 'DROPPED', 'NT'], default: 'FAILED' },
    dateRecorded: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\d{4}-\d{4}-\d$/, 'Student ID must follow the format: 0000-0000-0 (e.g. 2024-0001-1)']
    },
    name: { type: String, required: true, trim: true },
    yearLevel: { type: Number, default: 1 },
    section: { type: String, default: '' },
    classifier: { type: String, default: 'NONE', enum: ['CABE', 'CSP', 'NONE'] },
    grades: [gradeSchema]
}, { timestamps: true });

// Virtual: compute GWA
studentSchema.virtual('gwa').get(function () {
    if (!this.grades || this.grades.length === 0) return 0;
    const totalWeighted = this.grades.reduce((sum, g) => sum + (g.gwa * g.units), 0);
    const totalUnits = this.grades.reduce((sum, g) => sum + g.units, 0);
    return totalUnits > 0 ? parseFloat((totalWeighted / totalUnits).toFixed(4)) : 0;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
