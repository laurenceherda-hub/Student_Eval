// HTM Student Grade Evaluation System - HORIZONTAL FORMAT with LEC/LAB UNITS
const app = (function () {
    'use strict';

    let studentData = [];
    let chartInstance = null;

    // HTM Prospectus Database with SEPARATED Lec and Lab units
    const prospectusDB = [
        // FIRST YEAR - First Semester (26 total units)
        { code: 'GenEd1', name: 'Understanding the Self', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'GenEd2', name: 'Readings in the Philippine History', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'GenEd5', name: 'Purposive Communication', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'PC101', name: 'Kitchen Essentials & Basic Food Preparation', lec: 1, lab: 2, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'THC102', name: 'Risk Management as Applied to Safety, Security and Sanitation', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'NSTP1', name: 'National Service Training Program 1', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'PE1', name: 'Movement Enhancement (ME)', lec: 2, lab: 0, units: 2, year: 1, sem: 1, prerequisites: [] },
        { code: 'RS1', name: "God's Salvific Act", lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },
        { code: 'SC1', name: 'Fundamentals of Acctg/Bus. and Mgt. (Non-ABM)', lec: 3, lab: 0, units: 3, year: 1, sem: 1, prerequisites: [] },

        // FIRST YEAR - Second Semester (26 total units)
        { code: 'GenEd3', name: 'The Contemporary World', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: [] },
        { code: 'GenEd4', name: 'Mathematics in the Modern World', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: [] },
        { code: 'CBME201', name: 'Operations Management (TQM)', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: [] },
        { code: 'PC202', name: 'Fundamentals of Food Service Operations', lec: 2, lab: 1, units: 3, year: 1, sem: 2, prerequisites: ['PC101', 'THC102'] },
        { code: 'THC201', name: 'Philippine Culture and Tourism Geography', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: ['THC102'] },
        { code: 'NSTP2', name: 'National Service Training Program 2', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: ['NSTP1'] },
        { code: 'PE2', name: 'Fitness Exercises (FE)', lec: 2, lab: 0, units: 2, year: 1, sem: 2, prerequisites: ['PE1'] },
        { code: 'SC2', name: 'Organization and Management (Non-ABM)', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: [] },
        { code: 'RS2', name: 'Jesus and the Kingdom of God', lec: 3, lab: 0, units: 3, year: 1, sem: 2, prerequisites: ['RS1'] },

        // FIRST YEAR - Summer (9 total units)
        { code: 'PCE107', name: 'Philippine Regional Cuisine 1', lec: 1, lab: 2, units: 3, year: 1, sem: 'summer', prerequisites: ['PC101', 'THC102', 'PC202'] },
        { code: 'GenEd6', name: 'Arts Appreciation', lec: 3, lab: 0, units: 3, year: 1, sem: 'summer', prerequisites: [] },
        { code: 'GenEd10', name: 'Living in the IT Era', lec: 3, lab: 0, units: 3, year: 1, sem: 'summer', prerequisites: [] },

        // SECOND YEAR - First Semester (26 total units)
        { code: 'CBME302', name: 'Strategic Management', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: ['CBME201'] },
        { code: 'GenEd7', name: 'Science, Technology and Society', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: [] },
        { code: 'GenEd8', name: 'Ethics', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: [] },
        { code: 'THC303', name: 'Quality Service Management in Tourism and Hospitality', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: [] },
        { code: 'PC303', name: 'Fundamentals in Lodging Operations', lec: 2, lab: 1, units: 3, year: 2, sem: 1, prerequisites: ['THC201', 'THC102', 'PC202'] },
        { code: 'PCE306', name: 'Asian Cuisine', lec: 1, lab: 2, units: 3, year: 2, sem: 1, prerequisites: ['PC101', 'THC102', 'PC202'] },
        { code: 'PE3', name: 'Dance, Sports, Outdoor and Adventure I', lec: 2, lab: 0, units: 2, year: 2, sem: 1, prerequisites: ['PE2'] },
        { code: 'RS3', name: 'The Church and Her Celebrations', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: ['RS2'] },
        { code: 'SC3', name: 'Business Marketing (Non-ABM)', lec: 3, lab: 0, units: 3, year: 2, sem: 1, prerequisites: ['SC2'] },

        // SECOND YEAR - Second Semester (24 total units)
        { code: 'THC404', name: 'Legal Aspects in Tourism and Hospitality', lec: 3, lab: 0, units: 3, year: 2, sem: 2, prerequisites: ['THC201', 'THC303'] },
        { code: 'GenEd9', name: "Rizal's Life and Works", lec: 3, lab: 0, units: 3, year: 2, sem: 2, prerequisites: [] },
        { code: 'GenEd12', name: 'The Entrepreneurial Mind', lec: 3, lab: 0, units: 3, year: 2, sem: 2, prerequisites: [] },
        { code: 'PC404', name: 'Applied Business Tools and Technologies w/ Lab – PMS', lec: 2, lab: 1, units: 3, year: 2, sem: 2, prerequisites: ['PC303', 'PC202', 'PC101'] },
        { code: 'PCE428', name: 'Bar and Beverage Management', lec: 2, lab: 1, units: 3, year: 2, sem: 2, prerequisites: ['PC101', 'THC102', 'PC303'] },
        { code: 'THC405', name: 'Macro Perspective of Tourism and Hospitality', lec: 3, lab: 0, units: 3, year: 2, sem: 2, prerequisites: ['THC303'] },
        { code: 'PE4', name: 'Dance, Sports, Outdoor and Adventure II', lec: 2, lab: 0, units: 2, year: 2, sem: 2, prerequisites: ['PE3'] },
        { code: 'RS4', name: 'Christian Discipleship: Stewardship and Morality', lec: 3, lab: 0, units: 3, year: 2, sem: 2, prerequisites: ['RS3'] },
        { code: 'Driving', name: 'Basic Skills in Driving', lec: 0, lab: 1, units: 1, year: 2, sem: 2, prerequisites: [] },

        // SECOND YEAR - Summer (2 total units)
        { code: 'Practicum401', name: 'Practicum (200 hours) Bar/FnB/Culinary/Tourism', lec: 0, lab: 2, units: 2, year: 2, sem: 'summer', prerequisites: ['PC101', 'PC303', 'THC201'] },

        // THIRD YEAR - First Semester (24 total units)
        { code: 'PC505', name: 'Supply Chain Management in Hospitality Industry', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: ['PC404'] },
        { code: 'THC509', name: 'Micro Perspective of Tourism and Hospitality', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: ['THC405'] },
        { code: 'PC506', name: 'Introduction to MICE', lec: 2, lab: 1, units: 3, year: 3, sem: 1, prerequisites: ['THC303', 'THC404', 'PC404'] },
        { code: 'PCE204', name: 'Bread and Pastry', lec: 1, lab: 2, units: 3, year: 3, sem: 1, prerequisites: ['PC101', 'THC102', 'PCE428'] },
        { code: 'PC508', name: 'Foreign Language 1', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: ['THC303'] },
        { code: 'THC510', name: 'Entrepreneurship in Tourism and Hospitality', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: ['PC101', 'THC102'] },
        { code: 'GenEd11', name: 'Great Books', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: [] },
        { code: 'SC4', name: 'Business Finance (Non-ABM)', lec: 3, lab: 0, units: 3, year: 3, sem: 1, prerequisites: ['SC3'] },

        // THIRD YEAR - Second Semester (21 total units)
        { code: 'THC608', name: 'Tourism and Hospitality Marketing', lec: 3, lab: 0, units: 3, year: 3, sem: 2, prerequisites: ['THC510'] },
        { code: 'PC609', name: 'Foreign Language 2', lec: 3, lab: 0, units: 3, year: 3, sem: 2, prerequisites: ['PC508'] },
        { code: 'THC607', name: 'Multicultural Diversity in Workplace', lec: 3, lab: 0, units: 3, year: 3, sem: 2, prerequisites: ['THC405', 'THC509'] },
        { code: 'THC606', name: 'Professional Development and Applied Ethics', lec: 3, lab: 0, units: 3, year: 3, sem: 2, prerequisites: ['THC201', 'THC404'] },
        { code: 'PC607', name: 'Ergonomics and Facilities Planning', lec: 2, lab: 1, units: 3, year: 3, sem: 2, prerequisites: ['PC404'] },
        { code: 'PCE610', name: 'Halal Cookery', lec: 1, lab: 2, units: 3, year: 3, sem: 2, prerequisites: ['PC101', 'THC102', 'PCE306'] },
        { code: 'SC5', name: 'Applied Economics (Non-ABM)', lec: 3, lab: 0, units: 3, year: 3, sem: 2, prerequisites: ['SC4'] },

        // THIRD YEAR - Summer (2 total units)
        { code: 'Practicum601', name: 'Practicum (200 hours) Bread and Pastry', lec: 0, lab: 2, units: 2, year: 3, sem: 'summer', prerequisites: ['PC101', 'PC303', 'THC201', 'PCE204'] },

        // FOURTH YEAR - First Semester (3 total units)
        { code: 'PC710', name: 'Research in Hospitality', lec: 2, lab: 1, units: 3, year: 4, sem: 1, prerequisites: [] },

        // FOURTH YEAR - Second Semester (6 total units)
        { code: 'PRAC802', name: 'Practicum (Minimum of 600 hours)', lec: 0, lab: 6, units: 6, year: 4, sem: 2, prerequisites: [] }
    ];

    function init() {
        loadProspectus();
        setupDragAndDrop();
        setupModalClose();
    }

    function switchTab(tabName) {
        document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
        event.target.classList.add('active');

        if (tabName === 'dashboard' && studentData.length > 0) updateDashboard();
        else if (tabName === 'prospectus') loadProspectus();
    }

    function switchProspectusTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.getElementById('prospectus-' + tabName).classList.add('active');
        event.target.classList.add('active');
    }

    function setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        if (dt.files.length) handleFiles(dt.files[0]);
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (file) handleFiles(file);
    }

    function handleFiles(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (jsonData.length === 0) {
                    showAlert('uploadAlert', 'No data found in file!', 'error');
                    return;
                }

                processUploadedData(jsonData);
            } catch (error) {
                showAlert('uploadAlert', 'Error reading file: ' + error.message, 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Helper function for fuzzy string matching (Levenshtein distance based)
    function calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        const distance = matrix[len1][len2];
        const maxLength = Math.max(len1, len2);
        return 1 - distance / maxLength;
    }

    function processUploadedData(data) {
        const allColumns = Object.keys(data[0]);

        // Find ID and Name columns
        const idColumn = allColumns.find(col =>
            col.toLowerCase().includes('student') && col.toLowerCase().includes('id')
        ) || allColumns.find(col => col.toLowerCase() === 'id') || allColumns[0];

        const nameColumn = allColumns.find(col =>
            col.toLowerCase().includes('name') || col.toLowerCase().includes('student_name')
        ) || allColumns[1];

        // Subject columns are everything else
        const subjectColumns = allColumns.filter(col => col !== idColumn && col !== nameColumn);

        studentData = [];
        let unmatchedSubjects = [];

        console.log('Processing columns:', subjectColumns); // DEBUG

        data.forEach((row, index) => {
            // Skip header row if it's duplicated in data
            if (index === 0 && row[idColumn] === idColumn) return;

            const studentId = row[idColumn] || `HTM${String(index + 1).padStart(4, '0')}`;
            const studentName = row[nameColumn] || 'Unknown';

            subjectColumns.forEach(subjCol => {
                const gradeValue = row[subjCol];
                if (gradeValue === undefined || gradeValue === null || gradeValue === '') return;

                const gwa = parseFloat(gradeValue);
                if (isNaN(gwa)) return;

                // Normalize the Excel header: remove ALL whitespace, convert to uppercase
                const normalizedExcelCode = subjCol.toUpperCase().replace(/\s+/g, '').trim();

                console.log(`Looking for: "${subjCol}" → normalized: "${normalizedExcelCode}"`); // DEBUG

                // Try to find subject in prospectus with flexible matching
                let prospectusSub = prospectusDB.find(s => {
                    const normalizedDbCode = s.code.toUpperCase().replace(/\s+/g, '');
                    return normalizedDbCode === normalizedExcelCode;
                });

                // If no match found, try fuzzy matching for typos
                if (!prospectusSub && normalizedExcelCode.length >= 3) {
                    console.log(`  No exact match, trying fuzzy match...`); // DEBUG

                    let bestMatch = null;
                    let bestSimilarity = 0;

                    prospectusDB.forEach(s => {
                        const normalizedDbCode = s.code.toUpperCase().replace(/\s+/g, '');
                        const similarity = calculateSimilarity(normalizedExcelCode, normalizedDbCode);

                        if (similarity > bestSimilarity) {
                            bestSimilarity = similarity;
                            bestMatch = s;
                        }
                    });

                    console.log(`  Best match: ${bestMatch ? bestMatch.code : 'none'} with similarity ${bestSimilarity}`); // DEBUG

                    // Lower threshold to 0.6 for better typo tolerance
                    if (bestMatch && bestSimilarity >= 0.6) {
                        prospectusSub = bestMatch;
                    }
                }

                if (prospectusSub) {
                    console.log(`  ✓ MATCHED to: ${prospectusSub.code} - ${prospectusSub.name}`); // DEBUG
                } else {
                    console.log(`  ✗ NO MATCH`); // DEBUG
                    if (!unmatchedSubjects.includes(subjCol)) {
                        unmatchedSubjects.push(subjCol);
                    }
                }

                const units = prospectusSub ? prospectusSub.units : 3;
                const lec = prospectusSub ? prospectusSub.lec : 0;
                const lab = prospectusSub ? prospectusSub.lab : 0;

                const passed = gwa < 3.0;

                studentData.push({
                    id: studentId,
                    name: studentName,
                    subject: subjCol.toUpperCase().trim(),
                    subjectName: prospectusSub ? prospectusSub.name : subjCol,
                    matchedCode: prospectusSub ? prospectusSub.code : null,
                    gwa: gwa,
                    units: units,
                    lec: lec,
                    lab: lab,
                    passed: passed,
                    status: passed ? 'PASSED' : 'FAILED',
                    dateProcessed: new Date().toLocaleDateString()
                });
            });
        });

        if (studentData.length === 0) {
            showAlert('uploadAlert', 'No valid grade data found! Check your column headers.', 'error');
            return;
        }

        // Show warning if some subjects weren't matched
        if (unmatchedSubjects.length > 0) {
            console.warn('Unmatched subjects:', unmatchedSubjects);
        }

        showDetailedPreview();

        let successMsg = `✅ Successfully loaded ${studentData.length} subject records!`;
        if (unmatchedSubjects.length > 0) {
            successMsg += ` (Warning: ${unmatchedSubjects.length} subject(s) not found: ${unmatchedSubjects.join(', ')})`;
        }
        showAlert('uploadAlert', successMsg, unmatchedSubjects.length > 0 ? 'warning' : 'success');
    }

    function showDetailedPreview() {
        const previewSection = document.getElementById('previewSection');
        const previewContent = document.getElementById('previewContent');

        // Group by student
        const studentGroups = {};
        studentData.forEach(s => {
            if (!studentGroups[s.id]) studentGroups[s.id] = [];
            studentGroups[s.id].push(s);
        });

        let html = '';

        // Show first 3 students with detailed breakdown
        const previewStudents = Object.entries(studentGroups).slice(0, 3);

        previewStudents.forEach(([id, subjects]) => {
            const student = subjects[0];
            const totalLec = subjects.reduce((sum, s) => sum + s.lec, 0);
            const totalLab = subjects.reduce((sum, s) => sum + s.lab, 0);
            const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
            const totalWeighted = subjects.reduce((sum, s) => sum + (s.gwa * s.units), 0);
            const finalGWA = totalUnits > 0 ? totalWeighted / totalUnits : 0;
            const allPassed = subjects.every(s => s.passed) && finalGWA < 3.0;

            html += `
                <div class="preview-student-card">
                    <div class="preview-header">
                        <div>
                            <h4>${student.name} <span style="color: var(--text-muted); font-weight: 400;">(${id})</span></h4>
                        </div>
                        <div class="preview-gwa ${allPassed ? 'pass' : 'fail'}">
                            <div class="gwa-value">${finalGWA.toFixed(2)}</div>
                            <div class="gwa-label">GWA</div>
                        </div>
                    </div>
                    
                    <div class="preview-units-summary">
                        <span class="lec">📚 Lec: ${totalLec}</span>
                        <span class="lab">🔬 Lab: ${totalLab}</span>
                        <span class="total">⚡ Total: ${totalUnits}</span>
                        <span class="status-text ${allPassed ? 'pass' : 'fail'}">[${allPassed ? 'PASSED' : 'FAILED'}]</span>
                    </div>

                    <table class="preview-grades-table">
                        <thead>
                            <tr>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th style="text-align:center;">Lec</th>
                                <th style="text-align:center;">Lab</th>
                                <th style="text-align:center;">Grade</th>
                                <th style="text-align:center;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${subjects.map(s => `
                                <tr>
                                    <td class="subject-code">${s.matchedCode || s.subject}</td>
                                    <td class="subject-name">${s.subjectName}</td>
                                    <td class="lec-cell">${s.lec > 0 ? s.lec : '-'}</td>
                                    <td class="lab-cell">${s.lab > 0 ? s.lab : '-'}</td>
                                    <td>
                                        <span class="grade-cell ${s.passed ? 'pass' : 'fail'}">${s.gwa.toFixed(2)}</span>
                                    </td>
                                    <td class="status-cell ${s.passed ? 'pass' : 'fail'}">${s.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        if (Object.keys(studentGroups).length > 3) {
            html += `<div class="preview-more">... and ${Object.keys(studentGroups).length - 3} more students</div>`;
        }

        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
    }

    function processGrades() {
        updateDashboard();
        document.querySelector('[onclick="app.switchTab(\'dashboard\')"]').click();
    }

    function updateDashboard() {
        if (studentData.length === 0) {
            showAlert('dashboardAlert', 'No data available. Please upload grades first.', 'error');
            return;
        }

        const studentGroups = {};
        studentData.forEach(s => {
            if (!studentGroups[s.id]) studentGroups[s.id] = [];
            studentGroups[s.id].push(s);
        });

        Object.keys(studentGroups).forEach(id => {
            const subjects = studentGroups[id];
            const totalWeighted = subjects.reduce((sum, s) => sum + (s.gwa * s.units), 0);
            const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
            const finalGWA = totalUnits > 0 ? totalWeighted / totalUnits : 0;

            studentGroups[id].finalGWA = finalGWA;
            studentGroups[id].totalUnits = totalUnits;
            studentGroups[id].totalLec = subjects.reduce((sum, s) => sum + s.lec, 0);
            studentGroups[id].totalLab = subjects.reduce((sum, s) => sum + s.lab, 0);
            studentGroups[id].passedCount = subjects.filter(s => s.passed).length;
            studentGroups[id].allPassed = subjects.every(s => s.passed) && finalGWA < 3.0;
        });

        const passed = Object.values(studentGroups).filter(g => g.allPassed).length;
        const failed = Object.keys(studentGroups).length - passed;
        const allGWAs = Object.values(studentGroups).map(g => g.finalGWA);
        const avgGWA = allGWAs.reduce((a, b) => a + b, 0) / allGWAs.length;

        document.getElementById('totalStudents').textContent = Object.keys(studentGroups).length;
        document.getElementById('passedStudents').textContent = passed;
        document.getElementById('failedStudents').textContent = failed;
        document.getElementById('avgGWA').textContent = avgGWA.toFixed(2);

        updateChart(passed, failed);
        updateGradesTable(studentGroups);
    }

    function updateChart(passed, failed) {
        const ctx = document.getElementById('gradeChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Passed (GWA <3.0)', 'Failed (GWA ≥3.0)'],
                datasets: [{
                    data: [passed, failed],
                    backgroundColor: ['#11998e', '#eb3349'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    function updateGradesTable(studentGroups) {
        const tbody = document.querySelector('#gradesTable tbody');
        tbody.innerHTML = '';

        Object.entries(studentGroups).forEach(([id, group]) => {
            const student = group[0];
            const finalGWA = group.finalGWA;
            const totalUnits = group.totalUnits;
            const totalLec = group.totalLec;
            const totalLab = group.totalLab;
            const passedCount = group.passedCount;
            const allPassed = group.allPassed;
            const eligibleSubjects = getAllEligibleSubjects(group);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${student.id}</strong></td>
                <td>${student.name}</td>
                <td>${passedCount}/${group.length}</td>
                <td>
                    <span class="units-combined" title="Lec: ${totalLec}, Lab: ${totalLab}">
                        ${totalUnits}
                        <small style="display:block;color:#666;font-size:0.75rem;">
                            (${totalLec}+${totalLab})
                        </small>
                    </span>
                </td>
                <td>
                    <span class="gwa-display ${allPassed ? 'gwa-pass' : 'gwa-fail'}">
                        ${finalGWA.toFixed(2)}
                    </span>
                </td>
                <td>${allPassed ? '<span class="status-pass">PASSED</span>' : '<span class="status-fail">FAILED</span>'}</td>
                <td>
                    <div class="prereq-list">
                        ${eligibleSubjects.length > 0 ? eligibleSubjects.slice(0, 3).map(s =>
                `<span class="prereq-tag met">${s}</span>`
            ).join('') + (eligibleSubjects.length > 3 ? `<span class="prereq-tag pending">+${eligibleSubjects.length - 3}</span>` : '') : '<span style="color:#999;">-</span>'}
                    </div>
                </td>
                <td><button class="btn btn-primary" onclick="app.viewStudentDetail('${student.id}')" style="padding:5px 15px;font-size:12px;">View</button></td>
            `;
            tbody.appendChild(row);
        });
    }

    function getAllEligibleSubjects(studentSubjects) {
        const passedSubjects = studentSubjects.filter(s => s.passed).map(s => s.subject.toUpperCase());
        const eligible = [];

        prospectusDB.forEach(sub => {
            const prereqsMet = sub.prerequisites.every(prereq => {
                const prereqUpper = prereq.toUpperCase();
                return passedSubjects.includes(prereqUpper);
            });
            const notTaken = !studentSubjects.some(s => s.subject.toUpperCase() === sub.code.toUpperCase());

            if (prereqsMet && notTaken) eligible.push(sub.code);
        });

        return eligible;
    }

    function searchStudent() {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const resultsDiv = document.getElementById('searchResults');

        if (!query) {
            resultsDiv.innerHTML = '<div class="alert alert-error">Please enter a Student ID or Name</div>';
            return;
        }

        const studentGroups = {};
        studentData.forEach(s => {
            if (!studentGroups[s.id]) studentGroups[s.id] = [];
            studentGroups[s.id].push(s);
        });

        const matchedStudents = Object.entries(studentGroups).filter(([id, subjects]) => {
            const student = subjects[0];
            return id.toLowerCase().includes(query) || student.name.toLowerCase().includes(query);
        });

        if (matchedStudents.length === 0) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No students found</h3>
                    <p>No matches for "${query}"</p>
                </div>
            `;
            return;
        }

        let html = `<div class="alert alert-success">Found ${matchedStudents.length} student(s)</div>`;

        matchedStudents.forEach(([id, subjects]) => {
            const student = subjects[0];
            const totalWeighted = subjects.reduce((sum, s) => sum + (s.gwa * s.units), 0);
            const totalUnits = subjects.reduce((sum, s) => sum + s.units, 0);
            const totalLec = subjects.reduce((sum, s) => sum + s.lec, 0);
            const totalLab = subjects.reduce((sum, s) => sum + s.lab, 0);
            const finalGWA = totalUnits > 0 ? totalWeighted / totalUnits : 0;
            const passedCount = subjects.filter(s => s.passed).length;
            const allPassed = subjects.every(s => s.passed) && finalGWA < 3.0;
            const eligible = getAllEligibleSubjects(subjects);

            html += `
                <div class="student-card">
                    <div class="student-header">
                        <div>
                            <h2>${student.name}</h2>
                            <p class="student-id">ID: ${student.id}</p>
                        </div>
                        <span class="status-${allPassed ? 'pass' : 'fail'}">${allPassed ? 'PASSED' : 'FAILED'}</span>
                    </div>
                    
                    <div class="stats-grid-4">
                        <div class="stat-item">
                            <div class="stat-value ${allPassed ? 'pass' : 'fail'}">${finalGWA.toFixed(2)}</div>
                            <div class="stat-label">GWA</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${totalLec}</div>
                            <div class="stat-label">Lec Units</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${totalLab}</div>
                            <div class="stat-label">Lab Units</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${totalUnits}</div>
                            <div class="stat-label">Total</div>
                        </div>
                    </div>
                    
                    <h4>📚 Subject Grades:</h4>
                    <div class="subject-list-detailed">
                        ${subjects.map(s => `
                            <div class="subject-item-detailed">
                                <div class="subject-info">
                                    <strong>${s.matchedCode || s.subject}</strong>
                                    <span class="subject-fullname">${s.subjectName}</span>
                                </div>
                                <div class="subject-units">
                                    <span class="lec-lab-badge" title="Lecture + Laboratory">
                                        ${s.lec > 0 ? s.lec : '-'} + ${s.lab > 0 ? s.lab : '-'} = ${s.units}
                                    </span>
                                </div>
                                <div class="subject-grade">
                                    <span class="${s.passed ? 'grade-pass' : 'grade-fail'}">${s.gwa.toFixed(2)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <h4>🎯 Eligible for Enrollment (${eligible.length}):</h4>
                    <div class="enrollment-grid">
                        ${eligible.length > 0 ? eligible.map(code => {
                const sub = prospectusDB.find(s => s.code === code);
                return `
                                <div class="enrollment-card available">
                                    <div class="subject-code">${code}</div>
                                    <div class="subject-name">${sub ? sub.name : ''}</div>
                                    <div class="subject-meta">
                                        <span class="meta-item units" title="Lec: ${sub ? sub.lec : 0}, Lab: ${sub ? sub.lab : 0}">
                                            ${sub ? sub.units : '-'} units
                                        </span>
                                        <span class="meta-item">Year ${sub ? sub.year : '-'}</span>
                                    </div>
                                </div>
                            `;
            }).join('') : '<p style="color:#999;">No eligible subjects</p>'}
                    </div>
                    
                    <button class="btn btn-primary" onclick="app.viewStudentDetail('${student.id}')">View Full Details</button>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }

    function checkEnrollmentEligibility() {
        const query = document.getElementById('enrollSearchInput').value.trim();
        const resultsDiv = document.getElementById('enrollmentResults');

        if (!query) {
            resultsDiv.innerHTML = '<div class="alert alert-error">Please enter a Student ID</div>';
            return;
        }

        const studentGroups = {};
        studentData.forEach(s => {
            if (!studentGroups[s.id]) studentGroups[s.id] = [];
            studentGroups[s.id].push(s);
        });

        const matchedStudent = Object.entries(studentGroups).find(([id, subjects]) =>
            id.toLowerCase() === query.toLowerCase() || id.includes(query)
        );

        if (!matchedStudent) {
            resultsDiv.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>No records found</h3>
                    <p>Student ID "${query}" has no grade records</p>
                </div>
            `;
            return;
        }

        const [id, studentSubjects] = matchedStudent;
        const student = studentSubjects[0];
        const passedSubjects = studentSubjects.filter(s => s.passed).map(s => s.subject.toUpperCase());
        const failedSubjects = studentSubjects.filter(s => !s.passed).map(s => s.subject.toUpperCase());

        const totalWeighted = studentSubjects.reduce((sum, s) => sum + (s.gwa * s.units), 0);
        const totalUnits = studentSubjects.reduce((sum, s) => sum + s.units, 0);
        const totalLec = studentSubjects.reduce((sum, s) => sum + s.lec, 0);
        const totalLab = studentSubjects.reduce((sum, s) => sum + s.lab, 0);
        const finalGWA = totalUnits > 0 ? totalWeighted / totalUnits : 0;

        const available = [];
        const locked = [];
        const completed = [];

        prospectusDB.forEach(sub => {
            const isCompleted = studentSubjects.some(s => s.subject.toUpperCase() === sub.code.toUpperCase());
            const prereqsMet = sub.prerequisites.every(p => {
                const pUpper = p.toUpperCase();
                return passedSubjects.includes(pUpper);
            });
            const hasFailedPrereq = sub.prerequisites.some(p => {
                const pUpper = p.toUpperCase();
                return failedSubjects.includes(pUpper);
            });

            if (isCompleted) {
                const grade = studentSubjects.find(s => s.subject.toUpperCase() === sub.code.toUpperCase());
                completed.push({ ...sub, grade: grade });
            } else if (prereqsMet) {
                available.push(sub);
            } else {
                locked.push({ ...sub, reason: hasFailedPrereq ? 'Failed prerequisite' : 'Prerequisites not met' });
            }
        });

        let html = `
            <div class="student-summary">
                <h2>${student.name}</h2>
                <p>Student ID: ${student.id}</p>
                <div class="stats-row-4">
                    <div class="stat-box">
                        <div class="stat-number">${finalGWA.toFixed(2)}</div>
                        <div class="stat-label">Final GWA</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${totalLec}</div>
                        <div class="stat-label">Lec Units</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${totalLab}</div>
                        <div class="stat-label">Lab Units</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${available.length}</div>
                        <div class="stat-label">Available</div>
                    </div>
                </div>
            </div>

            <h3 class="section-header available">✅ Available for Enrollment (${available.length})</h3>
            <div class="enrollment-grid">
                ${available.map(sub => `
                    <div class="enrollment-card available">
                        <div class="subject-code">${sub.code}</div>
                        <div class="subject-name">${sub.name}</div>
                        <div class="subject-meta">
                            <span class="meta-item units" title="Lec: ${sub.lec}, Lab: ${sub.lab}">
                                ${sub.lec}+${sub.lab}=${sub.units} units
                            </span>
                            <span class="meta-item">Year ${sub.year}, Sem ${sub.sem}</span>
                        </div>
                        ${sub.prerequisites.length > 0 ? `
                            <div class="prereq-section">
                                <small>Prerequisites met:</small>
                                <div class="prereq-list">
                                    ${sub.prerequisites.map(p => `<span class="prereq-tag met">${p}</span>`).join('')}
                                </div>
                            </div>
                        ` : '<div class="prereq-section"><span class="prereq-tag met">No prerequisites</span></div>'}
                    </div>
                `).join('')}
            </div>

            <h3 class="section-header">📚 Completed (${completed.length})</h3>
            <div class="enrollment-grid">
                ${completed.map(sub => `
                    <div class="enrollment-card completed">
                        <div class="subject-code">${sub.code}</div>
                        <div class="subject-name">${sub.name}</div>
                        <div class="subject-meta">
                            <span class="meta-item units" title="Lec: ${sub.lec}, Lab: ${sub.lab}">
                                ${sub.lec}+${sub.lab}=${sub.units} units
                            </span>
                            <span class="grade-badge ${getGradeClass(sub.grade.gwa)}">
                                ${sub.grade.gwa.toFixed(2)}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h3 class="section-header locked">🔒 Locked (${locked.length})</h3>
            <div class="enrollment-grid">
                ${locked.map(sub => `
                    <div class="enrollment-card locked">
                        <div class="subject-code">${sub.code}</div>
                        <div class="subject-name">${sub.name}</div>
                        <div class="subject-meta">
                            <span class="meta-item units" title="Lec: ${sub.lec}, Lab: ${sub.lab}">
                                ${sub.lec}+${sub.lab}=${sub.units} units
                            </span>
                        </div>
                        <div class="locked-reason">🔒 ${sub.reason}</div>
                        ${sub.prerequisites.length > 0 ? `
                            <div class="prereq-section">
                                <small>Requires:</small>
                                <div class="prereq-list">
                                    ${sub.prerequisites.map(p => {
            const pUpper = p.toUpperCase();
            const isMet = passedSubjects.includes(pUpper);
            const isFailed = failedSubjects.includes(pUpper);
            return `<span class="prereq-tag ${isMet ? 'met' : (isFailed ? 'unmet' : 'pending')}">${p}</span>`;
        }).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        resultsDiv.innerHTML = html;
    }

    function getGradeClass(gwa) {
        if (gwa <= 1.75) return 'grade-excellent';
        if (gwa <= 2.50) return 'grade-good';
        if (gwa < 3.00) return 'grade-fair';
        if (gwa <= 4.00) return 'grade-poor';
        return 'grade-fail';
    }

    function viewStudentDetail(studentId) {
        const studentSubjects = studentData.filter(s => s.id.toString() === studentId.toString());
        if (studentSubjects.length === 0) return;

        const student = studentSubjects[0];
        const totalWeighted = studentSubjects.reduce((sum, s) => sum + (s.gwa * s.units), 0);
        const totalUnits = studentSubjects.reduce((sum, s) => sum + s.units, 0);
        const totalLec = studentSubjects.reduce((sum, s) => sum + s.lec, 0);
        const totalLab = studentSubjects.reduce((sum, s) => sum + s.lab, 0);
        const finalGWA = totalUnits > 0 ? totalWeighted / totalUnits : 0;
        const passedCount = studentSubjects.filter(s => s.passed).length;
        const allPassed = studentSubjects.every(s => s.passed) && finalGWA < 3.0;
        const eligible = getAllEligibleSubjects(studentSubjects);

        const modal = document.getElementById('studentModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <div class="student-detail">
                <h2>👤 ${student.name}</h2>
                
                <div class="detail-stats-grid">
                    <div class="detail-stat">
                        <div class="detail-stat-value ${allPassed ? 'pass' : 'fail'}">${finalGWA.toFixed(2)}</div>
                        <div class="detail-stat-label">Final GWA</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${totalLec}</div>
                        <div class="detail-stat-label">Lec Units</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${totalLab}</div>
                        <div class="detail-stat-label">Lab Units</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${totalUnits}</div>
                        <div class="detail-stat-label">Total Units</div>
                    </div>
                    <div class="detail-stat">
                        <div class="detail-stat-value">${passedCount}/${studentSubjects.length}</div>
                        <div class="detail-stat-label">Subjects Passed</div>
                    </div>
                </div>

                <h3>📊 Complete Grade Record</h3>
                <table class="modal-grades-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject Name</th>
                            <th style="text-align:center;">Lec</th>
                            <th style="text-align:center;">Lab</th>
                            <th style="text-align:center;">Total</th>
                            <th style="text-align:center;">Grade</th>
                            <th style="text-align:center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentSubjects.map(s => `
                            <tr>
                                <td class="code-cell">${s.matchedCode || s.subject}</td>
                                <td>${s.subjectName}</td>
                                <td style="text-align:center;">${s.lec > 0 ? s.lec : '-'}</td>
                                <td style="text-align:center;">${s.lab > 0 ? s.lab : '-'}</td>
                                <td style="text-align:center;"><strong>${s.units}</strong></td>
                                <td style="text-align:center;">
                                    <span class="grade-cell ${s.passed ? 'pass' : 'fail'}">${s.gwa.toFixed(2)}</span>
                                </td>
                                <td style="text-align:center;">
                                    <span class="status-cell ${s.passed ? 'pass' : 'fail'}">${s.status}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <h3>🎯 Enrollment Eligibility</h3>
                ${eligible.length > 0 ? `
                    <p class="eligible-message">✅ Eligible for ${eligible.length} subject(s):</p>
                    <div class="enrollment-grid">
                        ${eligible.map(code => {
            const sub = prospectusDB.find(s => s.code === code);
            return `
                                <div class="enrollment-card available">
                                    <div class="subject-code">${code}</div>
                                    <div class="subject-name">${sub ? sub.name : ''}</div>
                                    <div class="subject-meta">
                                        <span class="meta-item units" title="Lec: ${sub ? sub.lec : 0}, Lab: ${sub ? sub.lab : 0}">
                                            ${sub ? sub.lec : 0}+${sub ? sub.lab : 0}=${sub ? sub.units : 0} units
                                        </span>
                                        <span class="meta-item">Year ${sub ? sub.year : '-'}</span>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                ` : `
                    <div class="alert alert-error">
                        ❌ Not eligible for new enrollments.<br>
                        ${studentSubjects.some(s => !s.passed) ? 'Must pass all subjects (GWA <3.0).' : 'All prerequisites completed.'}
                    </div>
                `}
            </div>
        `;

        modal.style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('studentModal').style.display = 'none';
    }

    function setupModalClose() {
        window.onclick = function (event) {
            const modal = document.getElementById('studentModal');
            if (event.target === modal) modal.style.display = 'none';
        };
    }

    function loadProspectus() {
        const years = [1, 2, 3, 4];
        const sems = [1, 2, 'summer'];

        years.forEach(year => {
            const container = document.getElementById(`year${year}Content`);
            if (!container) return;

            let html = '';

            sems.forEach(sem => {
                const subjects = prospectusDB.filter(s => s.year === year && s.sem === sem);
                if (subjects.length === 0) return;

                const semName = sem === 1 ? 'First Semester' : (sem === 2 ? 'Second Semester' : 'Summer');

                html += `
                    <div class="semester-section">
                        <div class="semester-title">${semName}</div>
                        <table class="prospectus-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Course Title</th>
                                    <th style="text-align:center;">Lec</th>
                                    <th style="text-align:center;">Lab</th>
                                    <th style="text-align:center;">Total</th>
                                    <th>Prerequisites</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subjects.map(sub => `
                                    <tr>
                                        <td class="code-cell">${sub.code}</td>
                                        <td>${sub.name}</td>
                                        <td style="text-align:center;">${sub.lec > 0 ? sub.lec : '-'}</td>
                                        <td style="text-align:center;">${sub.lab > 0 ? sub.lab : '-'}</td>
                                        <td style="text-align:center;"><span class="units-cell">${sub.units}</span></td>
                                        <td class="prereq-cell">${
                                            sub.code.toUpperCase() === 'PC710' ? 'Taken all subjects for the last 6 semesters (Including Summer).' :
                                            sub.code.toUpperCase() === 'PRAC802' ? 'Taken all subjects for the last 7 semesters and Research.(including Summer)' :
                                            (sub.prerequisites.length > 0 ? sub.prerequisites.join(', ') : 'None')
                                        }</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            });

            container.innerHTML = html || '<p style="color:#999;padding:20px;">No subjects found for this year.</p>';
        });
    }

    function clearData() {
        if (confirm('Clear all uploaded data?')) {
            studentData = [];
            document.getElementById('previewSection').classList.add('hidden');
            document.getElementById('uploadAlert').innerHTML = '';
        }
    }

    function showAlert(elementId, message, type) {
        const alertDiv = document.getElementById(elementId);
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => alertDiv.innerHTML = '', 5000);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        switchTab,
        switchProspectusTab,
        handleFile,
        processGrades,
        searchStudent,
        checkEnrollmentEligibility,
        viewStudentDetail,
        closeModal,
        clearData
    };
})();