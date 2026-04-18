const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Subject = require('../models/Subject');

function formatStudent(doc) {
    const s = doc.toJSON();
    
    let totalUnits = 0;
    let totalLec = 0;
    let totalLab = 0;
    let passedCount = 0;
    let validUnitsForGWA = 0;
    let totalWeighted = 0;

    (s.grades || []).forEach(g => {
        const units = g.units || 0;
        totalUnits += units;
        totalLec += g.lec || 0;
        totalLab += g.lab || 0;
        
        if (g.passed) passedCount++;
        
        // Exclude special grades (7=DROPPED, 8=INC, 9=NT) from GWA
        if (g.gwa >= 1.0 && g.gwa <= 5.0) {
            validUnitsForGWA += units;
            totalWeighted += g.gwa * units;
        }
    });

    s.totalUnits = totalUnits;
    s.totalLec = totalLec;
    s.totalLab = totalLab;
    s.passedCount = passedCount;
    s.finalGWA = validUnitsForGWA > 0 ? (totalWeighted / validUnitsForGWA) : 0;
    s.allPassed = s.grades && s.grades.length > 0 ? passedCount === s.grades.length : false;
    
    return s;
}

// GET all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().sort({ name: 1 });
        res.json({ success: true, data: students.map(formatStudent) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const students = await Student.find();
        const formatted = students.map(formatStudent);
        
        const totalStudents = formatted.length;
        let passed = 0;
        let failed = 0;
        let totalGWA = 0;
        let studentsWithGWA = 0;
        
        formatted.forEach(s => {
            if (s.finalGWA > 0) {
                totalGWA += s.finalGWA;
                studentsWithGWA++;
                if (s.finalGWA <= 3.0) passed++;
                else failed++;
            }
        });
        
        const avgGWA = studentsWithGWA > 0 ? (totalGWA / studentsWithGWA) : 0;
        
        res.json({
            success: true,
            data: { totalStudents, passed, failed, avgGWA: avgGWA || 0 }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// SEARCH students
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const students = await Student.find({
            $or: [
                { studentId: new RegExp(query, 'i') },
                { name: new RegExp(query, 'i') }
            ]
        });
        res.json({ success: true, data: students.map(formatStudent) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET student eligibility
router.get('/:studentId/eligibility', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const formatted = formatStudent(student);
        const subjects = await Subject.find();
        
        const passedCodes = formatted.grades.filter(g => g.passed).map(g => g.subjectCode.toUpperCase());
        const takenCodes = formatted.grades.map(g => g.subjectCode.toUpperCase());
        
        const available = [];
        const locked = [];
        // Optional complete list
        const completed = formatted.grades.filter(g => g.passed);
        
        subjects.forEach(sub => {
            if (takenCodes.includes(sub.code.toUpperCase())) return;
            
            const prereqs = sub.prerequisites || [];
            let met = true;
            for (let pg of prereqs) {
                if (!passedCodes.includes(pg.toUpperCase())) {
                    met = false;
                    break;
                }
            }
            
            if (met) available.push(sub);
            else locked.push(sub);
        });
        
        formatted.eligibility = { available, locked, completed };
        
        res.json({ success: true, data: formatted });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET general student
router.get('/:studentId', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.studentId });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: formatStudent(student) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST save grades
router.post('/grades', async (req, res) => {
    try {
        const { studentId, name, yearLevel, classifier, semester, grades } = req.body;
        
        if (!studentId || !name || !grades || grades.length === 0) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        let student = await Student.findOne({ studentId });
        if (!student) {
            student = new Student({ studentId, name, yearLevel, classifier });
        } else {
            student.name = name;
            if (yearLevel) student.yearLevel = yearLevel;
            if (classifier) student.classifier = classifier;
        }

        for (const g of grades) {
            const subject = await Subject.findOne({ code: new RegExp(`^${g.subjectCode}$`, 'i') });
            
            let status = 'FAILED';
            let passed = false;
            let finalGwa = parseFloat(g.gwa);
            
            if (isNaN(finalGwa)) finalGwa = 5.0;

            if (finalGwa === 9) status = 'NT';
            else if (finalGwa === 8) status = 'INC';
            else if (finalGwa === 7) status = 'DROPPED';
            else if (finalGwa >= 1.0 && finalGwa <= 3.0) {
                status = 'PASSED';
                passed = true;
            } else if (finalGwa > 3.0 && finalGwa <= 5.0) {
                finalGwa = 5.0;
                status = 'FAILED';
            }

            const newGrade = {
                subjectCode: g.subjectCode.toUpperCase(),
                subjectName: subject ? subject.name : 'Unknown Subject',
                gwa: finalGwa,
                schoolYear: g.schoolYear || '',
                units: subject ? subject.units : 3,
                lec: subject ? subject.lec : 0,
                lab: subject ? subject.lab : 0,
                passed,
                status
            };

            const isDuplicate = student.grades.some(eg => 
                eg.subjectCode.toUpperCase() === newGrade.subjectCode && 
                eg.schoolYear === newGrade.schoolYear &&
                eg.gwa === newGrade.gwa &&
                eg.status === newGrade.status
            );

            if (!isDuplicate) {
                student.grades.push(newGrade);
            }
        }
        
        await student.save();
        res.json({ success: true, data: formatStudent(student) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
