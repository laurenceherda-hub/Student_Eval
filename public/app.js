// HTM Student Grade Evaluation System - Frontend App
// Communicates with Express + MongoDB backend via REST API
'use strict';

const API_BASE = '/api';
let chartInstance = null;
let prospectusCache = [];

const app = (() => {

    // ─── Init ──────────────────────────────────────────────────────────────────
    async function init() {
        setupNavTabs();
        setupYearTabs();
        setupSearchEnterKey();
        await loadProspectus();    // Start with prospectus tab
        buildGradeCenter();        // Build grade center form
    }

    // ─── Navigation ─────────────────────────────────────────────────────────────
    function setupNavTabs() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', function () {
                const tabName = this.dataset.tab;
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(tabName).classList.add('active');

                if (tabName === 'dashboard') loadDashboard();
                else if (tabName === 'prospectus' && prospectusCache.length === 0) loadProspectus();
            });
        });
    }

    function setupYearTabs() {
        document.querySelectorAll('.year-tab').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.year-content').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('prospectus-' + this.dataset.year).classList.add('active');
            });
        });
    }

    // Auto-format search input as student ID (0000-0000-0) when purely numeric
    function autoFormatSearchId(input) {
        const val = input.value;
        // If the user has typed any letter, it's a name search — skip formatting
        if (/[a-zA-Z]/.test(val)) return;
        let digits = val.replace(/\D/g, '').substring(0, 9);
        let formatted = digits;
        if (digits.length > 4 && digits.length <= 8) {
            formatted = digits.slice(0, 4) + '-' + digits.slice(4);
        } else if (digits.length > 8) {
            formatted = digits.slice(0, 4) + '-' + digits.slice(4, 8) + '-' + digits.slice(8, 9);
        }
        input.value = formatted;
    }

    function setupSearchEnterKey() {
        const searchInput = document.getElementById('searchInput');
        const enrollInput = document.getElementById('enrollSearchInput');
        const gradeRecordInput = document.getElementById('gradeRecordSearchInput');

        let searchTimeout = null;
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                autoFormatSearchId(searchInput);
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (searchInput.value.trim() !== '') {
                        searchStudent();
                    } else {
                        document.getElementById('searchResults').innerHTML = '';
                    }
                }, 300);
            });
            searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') searchStudent(); });
        }

        if (enrollInput) {
            enrollInput.addEventListener('input', () => {
                autoFormatSearchId(enrollInput);
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (enrollInput.value.trim() !== '') {
                        checkEnrollmentEligibility();
                    } else {
                        document.getElementById('enrollmentResults').innerHTML = '';
                    }
                }, 300);
            });
            enrollInput.addEventListener('keyup', e => { if (e.key === 'Enter') checkEnrollmentEligibility(); });
        }
        if (gradeRecordInput) {
            gradeRecordInput.addEventListener('input', () => {
                autoFormatSearchId(gradeRecordInput);
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (gradeRecordInput.value.trim() !== '') {
                        checkGradeRecord();
                    } else {
                        document.getElementById('gradeRecordResults').innerHTML = '';
                    }
                }, 300);
            });
            gradeRecordInput.addEventListener('keyup', e => { if (e.key === 'Enter') checkGradeRecord(); });
        }
    }

    // ─── Prospectus ─────────────────────────────────────────────────────────────
    async function loadProspectus() {
        try {
            const res = await fetch(`${API_BASE}/prospectus`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            prospectusCache = json.data;
            renderProspectus(json.data);
        } catch (err) {
            console.error('Prospectus load error:', err);
            showAlert('gradeCenterAlert', '⚠️ Could not load prospectus from server. Is MongoDB running?', 'warning');
            // Fallback: render empty state
            [1, 2, 3, 4].forEach(yr => {
                const el = document.getElementById(`prospectus-year${yr}`);
                if (el) el.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔌</div><h3>Server not connected</h3><p>Start the server and MongoDB to load prospectus data.</p></div>`;
            });
        }
    }

    function filterProspectus() {
        const query = document.getElementById('prospectusSearchInput').value.toLowerCase().trim();
        if (!query) {
            renderProspectus(prospectusCache);
            return;
        }

        const filtered = prospectusCache.filter(sub =>
            sub.code.toLowerCase().includes(query) ||
            sub.name.toLowerCase().includes(query)
        );
        renderProspectus(filtered);
    }

    function renderProspectus(subjects) {
        const years = [1, 2, 3, 4];
        const sems = [1, 2, 'summer'];

        years.forEach(year => {
            const container = document.getElementById(`prospectus-year${year}`);
            if (!container) return;

            let html = '';
            sems.forEach(sem => {
                const filtered = subjects.filter(s => s.year == year && s.sem == sem);
                if (filtered.length === 0) return;

                const semLabel = sem === 1 ? 'First Semester' : sem === 2 ? 'Second Semester' : 'Summer';
                const totalUnits = filtered.reduce((sum, s) => sum + s.units, 0);

                html += `
                    <div class="semester-section">
                        <div class="semester-title">${semLabel} <small style="font-weight:400;color:var(--text-muted);margin-left:auto;">${totalUnits} units</small></div>
                        <div class="table-container">
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
                                    ${filtered.map(sub => `
                                        <tr>
                                            <td class="code-cell">${sub.code}</td>
                                            <td>${sub.name}</td>
                                            <td style="text-align:center;">${sub.lec > 0 ? sub.lec : '—'}</td>
                                            <td style="text-align:center;">${sub.lab > 0 ? sub.lab : '—'}</td>
                                            <td style="text-align:center;"><span class="units-cell">${sub.units}</span></td>
                                            <td class="prereq-cell">${sub.code.toUpperCase() === 'PC710' ? 'Taken all subjects for the last 6 semesters (Including Summer).' :
                        sub.code.toUpperCase() === 'PRAC802' ? 'Taken all subjects for the last 7 semesters and Research (including Summer).' :
                            (sub.prerequisites && sub.prerequisites.length > 0 ? sub.prerequisites.join(', ') : '<span style="color:var(--text-muted)">None</span>')
                    }</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html || `<div class="empty-state"><p>No subjects found for Year ${year}.</p></div>`;
        });
    }

    // ─── Grade Center ─────────────────────────────────────────────────────────────
    function buildGradeCenter() {
        const container = document.getElementById('gradeCenterContent');
        const datalistOptions = prospectusCache.length > 0
            ? prospectusCache.map(s => `<option value="${s.code}">${s.name}</option>`).join('')
            : '';

        container.innerHTML = `
            <div class="grade-center-form">
                <datalist id="grade-center-datalist">${datalistOptions}</datalist>
                <div class="form-grid-2">
                    <div class="form-group">
                        <label class="form-label">Student ID * <small style="font-weight:400;color:var(--text-muted);">(format: 0000-0000-0)</small></label>
                        <input class="form-control" id="gc-studentId" placeholder="e.g. 2024-0001-1" maxlength="12"
                               oninput="app.formatStudentId(this)" autocomplete="off" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Full Name *</label>
                        <input class="form-control" id="gc-name" placeholder="e.g. Juan Dela Cruz" />
                    </div>
                </div>

                <div style="margin: 0.75rem 0 1.25rem; padding: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.75rem;">
                    <input type="checkbox" id="gc-isABM" style="width:1.2rem; height:1.2rem; cursor:pointer;" onchange="app.updateGradeCenterRows()" />
                    <label for="gc-isABM" style="font-weight:600; color:#166534; cursor:pointer; font-size:0.95rem; display:flex; align-items:center;">
                        ABM Student <small style="font-weight:400; color:#15803d; margin-left:0.5rem;">(Automatically credits SC1, SC2, SC3, SC4, and SC5 as PASSED)</small>
                    </label>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top:var(--space-sm);">
                    <div class="form-group">
                        <label class="form-label">School Year</label>
                        <input class="form-control" id="gc-schoolYear" placeholder="e.g. 2023-2024" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year Level</label>
                        <select class="form-control" id="gc-yearLevel" onchange="app.updateGradeCenterRows()">
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Semester</label>
                        <select class="form-control" id="gc-semester" onchange="app.updateGradeCenterRows()">
                            <option value="1">1st Semester</option>
                            <option value="2">2nd Semester</option>
                            <option value="summer">Summer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Program (Classifer)</label>
                        <select class="form-control" id="gc-classifier">
                            <option value="NONE">None</option>
                            <option value="CABE">CABE</option>
                            <option value="CSP">CSP</option>
                        </select>
                    </div>
                </div>

                <div class="subjects-entry-area">
                    <div class="subjects-entry-title"> Subject Grades</div>
                    <div id="subjectRows"></div>
                    <button class="add-subject-btn" onclick="app.addSubjectRow()">
                         Add Subject
                    </button>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="app.submitGrades()"> Save Grades</button>
                    <button class="btn btn-danger" onclick="app.clearGradeForm()" style="background: transparent; color: var(--cj-red); box-shadow:none; border: 2px solid rgba(184,0,14,0.3);">Clear</button>
                </div>
            </div>

            <div id="gradeCenterPreview"></div>
        `;

        updateGradeCenterRows();
    }

    function updateGradeCenterRows() {
        const year = parseInt(document.getElementById('gc-yearLevel').value) || 1;
        let sem = document.getElementById('gc-semester').value || 1;
        if (sem !== 'summer') sem = parseInt(sem);
        const isABM = document.getElementById('gc-isABM')?.checked || false;

        const container = document.getElementById('subjectRows');
        container.innerHTML = '';

        let subjects = prospectusCache.filter(s => s.year === year && s.sem === sem);

        if (isABM) {
            const abmCodes = ['SC1', 'SC2', 'SC3', 'SC4', 'SC5'];
            subjects = subjects.filter(s => !abmCodes.includes(s.code.toUpperCase()));
        }

        if (subjects.length > 0) {
            subjects.forEach(s => addSubjectRow(s.code));
        } else {
            addSubjectRow();
        }
    }

    function addSubjectRow(defaultCode = '') {
        const container = document.getElementById('subjectRows');
        const idx = container.children.length;

        const row = document.createElement('div');
        row.className = 'subject-row';

        row.innerHTML = `
            <div class="form-group">
                <label class="form-label">${idx === 0 ? 'Subject Code' : ''}</label>
                <input type="text" class="form-control subject-code-input" list="grade-center-datalist" placeholder="Search Code..." style="text-transform:uppercase;" autocomplete="off" value="${defaultCode}" />
            </div>
            <div class="form-group">
                <label class="form-label">${idx === 0 ? 'Subject Name (optional)' : ''}</label>
                <input class="form-control subject-name-input" placeholder="Auto-detected from prospectus" readonly style="background:#f9f9f9;cursor:not-allowed;" />
            </div>
            <div class="form-group">
                <label class="form-label">${idx === 0 ? 'Grade&nbsp;<small style="font-weight:400;color:var(--text-muted);">(1.0–3.0 | 5=Failed | 7=Dropped | 8=INC | 9=NT)</small>' : ''}</label>
                <input class="form-control subject-grade-input" type="number" min="1.0" max="9" step="0.25" placeholder="e.g. 1.50" />
            </div>
            <div style="padding-top:${idx === 0 ? '22px' : '0'}">
                <button class="btn-icon" title="Remove row" onclick="this.closest('.subject-row').remove()">\u{1F5D1}\uFE0F</button>
            </div>
        `;

        const codeInput = row.querySelector('.subject-code-input');
        const nameInput = row.querySelector('.subject-name-input');
        const gradeInput = row.querySelector('.subject-grade-input');

        codeInput.addEventListener('input', () => {
            const code = codeInput.value.trim().toUpperCase();
            if (!code) { nameInput.value = ''; return; }

            // If this row itself is a Lab row (code ends with ' LAB')
            if (code.endsWith(' LAB')) {
                const parentCode = code.slice(0, -4).trim();
                const parent = prospectusCache.find(s => s.code.toUpperCase() === parentCode);
                nameInput.value = parent ? `${parent.name} Lab` : '';
                nameInput.style.color = parent ? '#0d5c2e' : '';
                return;
            }

            const found = prospectusCache.find(s => s.code.toUpperCase() === code);
            if (found) {
                nameInput.value = found.name;
                nameInput.style.color = '#0d5c2e';
                // Auto-insert a dedicated lab row right after this one
                if (found.lab > 0) {
                    const nextSibling = row.nextElementSibling;
                    const nextCode = nextSibling?.querySelector('.subject-code-input')?.value.trim().toUpperCase() || '';
                    if (nextCode !== `${code} LAB`) {
                        row.insertAdjacentElement('afterend', buildLabRow(`${code} Lab`, `${found.name} Lab`));
                    }
                }
            } else {
                nameInput.value = 'Subject not found in prospectus';
                nameInput.style.color = '#8B0000';
            }
        });

        gradeInput.addEventListener('input', () => {
            const val = parseFloat(gradeInput.value);
            gradeInput.title = '';
            if (val === 9) gradeInput.title = 'NT \u2014 No Test/Exam';
            else if (val === 8) gradeInput.title = 'INC \u2014 Incomplete';
            else if (val === 7) gradeInput.title = 'DROPPED \u2014 Subject Dropped';
            else if (val > 3.0 && val <= 5.0) gradeInput.title = 'Will be saved as 5.0 \u2014 FAILED';
        });

        container.appendChild(row);

        if (defaultCode) codeInput.dispatchEvent(new Event('input'));
    }

    function buildLabRow(labCode, labName) {
        const row = document.createElement('div');
        row.className = 'subject-row lab-row';
        row.innerHTML = `
            <div class="form-group">
                <label class="form-label"></label>
                <input type="text" class="form-control subject-code-input" value="${labCode}" readonly
                    style="text-transform:uppercase;background:#fff8e1;border-color:rgba(212,160,23,0.5);font-weight:600;cursor:not-allowed;" />
            </div>
            <div class="form-group">
                <label class="form-label"></label>
                <input class="form-control subject-name-input" value="${labName}" readonly
                    style="background:#f9f9f9;cursor:not-allowed;color:#0d5c2e;" />
            </div>
            <div class="form-group">
                <label class="form-label"></label>
                <input class="form-control subject-grade-input" type="number" min="1.0" max="9" step="0.25"
                    placeholder="Lab grade" style="background:#fff8e1;border-color:rgba(212,160,23,0.5);" />
            </div>
            <div>
                <button class="btn-icon" title="Remove lab row" onclick="this.closest('.subject-row').remove()">\u{1F5D1}\uFE0F</button>
            </div>
        `;
        const gradeInput = row.querySelector('.subject-grade-input');
        gradeInput.addEventListener('input', () => {
            const val = parseFloat(gradeInput.value);
            gradeInput.title = '';
            if (val === 9) gradeInput.title = 'NT \u2014 No Test/Exam';
            else if (val === 8) gradeInput.title = 'INC \u2014 Incomplete';
            else if (val === 7) gradeInput.title = 'DROPPED \u2014 Subject Dropped';
            else if (val > 3.0 && val <= 5.0) gradeInput.title = 'Will be saved as 5.0 \u2014 FAILED';
        });
        return row;
    }

    let studentIdFetchTimeout = null;

    // Format Student ID as user types: 0000-0000-0
    function formatStudentId(input) {
        // If user typed letters, skip digit formatting
        if (/[a-zA-Z]/.test(input.value)) {
            // Still allow searching if it looks like an ID
            fetchStudentTakenSubjects(input.value);
            return;
        }

        let digits = input.value.replace(/\D/g, '').substring(0, 9);
        let formatted = digits;
        if (digits.length > 4 && digits.length <= 8) {
            formatted = digits.slice(0, 4) + '-' + digits.slice(4);
        } else if (digits.length > 8) {
            formatted = digits.slice(0, 4) + '-' + digits.slice(4, 8) + '-' + digits.slice(8, 9);
        }
        input.value = formatted;

        const idPattern = /^[a-zA-Z0-9-]+$/;
        if (idPattern.test(formatted)) {
            clearTimeout(studentIdFetchTimeout);
            studentIdFetchTimeout = setTimeout(() => {
                fetchStudentTakenSubjects(formatted);
            }, 600);
        } else {
            updateGradeCenterDatalist([]);
        }
    }

    function updateGradeCenterDatalist(takenCodes) {
        const datalist = document.getElementById('grade-center-datalist');
        if (!datalist) return;

        const isABM = document.getElementById('gc-isABM')?.checked || false;
        const abmCodes = ['SC1', 'SC2', 'SC3', 'SC4', 'SC5'];

        const available = prospectusCache.filter(s => {
            const code = s.code.toUpperCase();
            if (takenCodes.includes(code)) return false;
            // Also filter out ABM subjects if student is ABM
            if (isABM && abmCodes.includes(code)) return false;
            return true;
        });
        datalist.innerHTML = available.map(s => `<option value="${s.code}">${s.name}</option>`).join('');
    }

    async function fetchStudentTakenSubjects(studentId) {
        try {
            const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`);
            const json = await res.json();
            if (json.success && json.data) {
                const s = json.data;

                // Populate student info if found
                const abmCheckbox = document.getElementById('gc-isABM');
                const nameInput = document.getElementById('gc-name');
                const classifierSelect = document.getElementById('gc-classifier');

                if (abmCheckbox && s.isABM !== undefined) {
                    abmCheckbox.checked = s.isABM;
                }
                if (nameInput && s.name) {
                    nameInput.value = s.name;
                }
                if (classifierSelect && s.classifier) {
                    classifierSelect.value = s.classifier;
                }

                updateGradeCenterRows();

                const takenCodes = (s.grades || []).map(g => g.subjectCode.toUpperCase());
                updateGradeCenterDatalist(takenCodes);
            } else {
                updateGradeCenterDatalist([]);
            }
        } catch (err) {
            updateGradeCenterDatalist([]);
        }
    }

    async function submitGrades() {
        const studentId = document.getElementById('gc-studentId').value.trim();
        const name = document.getElementById('gc-name').value.trim();
        const isABM = document.getElementById('gc-isABM').checked;
        const yearLevel = parseInt(document.getElementById('gc-yearLevel').value);
        const classifier = document.getElementById('gc-classifier').value;
        let semester = document.getElementById('gc-semester').value;
        if (semester !== 'summer') semester = parseInt(semester);
        const schoolYear = document.getElementById('gc-schoolYear').value.trim();

        const idPattern = /^[a-zA-Z0-9-]+$/;
        if (!studentId || !name) {
            showAlert('gradeCenterAlert', '❌ Student ID and Name are required.', 'error');
            return;
        }
        if (!idPattern.test(studentId)) {
            showAlert('gradeCenterAlert', '❌ Student ID must contain only letters, numbers, and hyphens.', 'error');
            return;
        }

        const rows = document.querySelectorAll('.subject-row');
        const grades = [];

        rows.forEach(row => {
            const code = row.querySelector('.subject-code-input')?.value.trim().toUpperCase();
            const gwa = parseFloat(row.querySelector('.subject-grade-input')?.value);
            if (!code || isNaN(gwa)) return;
            grades.push({ subjectCode: code, schoolYear, gwa });
        });

        if (grades.length === 0) {
            showAlert('gradeCenterAlert', '❌ Please add at least one subject grade.', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/students/grades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, name, yearLevel, classifier, semester, grades, isABM })
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            const subjectCount = rows.length;
            showAlert('gradeCenterAlert', `✅ Grades saved for ${name} (${studentId}) — ${grades.length} entry(ies) recorded.`, 'success');
            showToast('Grades saved successfully!', 'success');

            // Clear the form but keep the success alert visible
            clearGradeForm(true);
        } catch (err) {
            showAlert('gradeCenterAlert', `❌ Error: ${err.message}`, 'error');
        }
    }

    function getGradeDisplay(gwa, passed, status) {
        if (status === 'NT') return { label: '9', cls: 'grade-special' };
        if (status === 'INC') return { label: '8', cls: 'grade-special' };
        if (status === 'DROPPED') return { label: '7', cls: 'grade-dropped' };
        return { label: gwa.toFixed(2), cls: passed ? 'pass' : 'fail' };
    }

    function renderGradeCenterPreview(student) {
        const container = document.getElementById('gradeCenterPreview');
        const grades = student.grades || [];
        const gwa = student.finalGWA || 0;
        const passed = student.allPassed;

        container.innerHTML = `
            <div class="preview-student-card">
                <div class="preview-header">
                    <div>
                        <h4>${student.name} <span style="color:var(--text-muted);font-weight:400;">(${student.studentId})</span></h4>
                    </div>
                    <div class="preview-gwa ${passed ? 'pass' : 'fail'}">
                        <div class="gwa-value">${gwa.toFixed(2)}</div>
                        <div class="gwa-label">GWA</div>
                    </div>
                </div>
                <div class="preview-units-summary">
                    <span class="lec"> Lec: ${student.totalLec}</span>
                    <span class="lab"> Lab: ${student.totalLab}</span>
                    <span class="total">⚡ Total: ${student.totalUnits}</span>
                    <span class="status-text ${passed ? 'pass' : 'fail'}">[${passed ? 'PASSED' : 'FAILED'}]</span>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Code</th><th>Subject</th><th>Lec</th><th>Lab</th><th>Grade</th><th>Status</th></tr></thead>
                        <tbody>
                            ${grades.map(g => {
            const disp = getGradeDisplay(g.gwa, g.passed, g.status);
            const statusCls = ['NT', 'INC', 'DROPPED'].includes(g.status) ? 'grade-special' : (g.passed ? 'pass' : 'fail');
            return `
                                <tr>
                                    <td class="code-cell">${g.subjectCode}</td>
                                    <td>${g.subjectName}</td>
                                    <td class="lec-cell">${g.lec > 0 ? g.lec : '—'}</td>
                                    <td class="lab-cell">${g.lab > 0 ? g.lab : '—'}</td>
                                    <td><span class="grade-cell ${disp.cls}">${disp.label}</span></td>
                                    <td><span class="status-cell ${statusCls}">${g.status}</span></td>
                                </tr>`;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function clearGradeForm(keepAlert = false) {
        document.getElementById('gc-studentId').value = '';
        document.getElementById('gc-name').value = '';
        document.getElementById('gc-isABM').checked = false;
        if (document.getElementById('gc-schoolYear')) document.getElementById('gc-schoolYear').value = '';
        document.getElementById('subjectRows').innerHTML = '';
        document.getElementById('gradeCenterPreview').innerHTML = '';
        if (keepAlert !== true) {
            document.getElementById('gradeCenterAlert').innerHTML = '';
        }
        updateGradeCenterDatalist([]);
        updateGradeCenterRows();
    }

    // ─── Dashboard ─────────────────────────────────────────────────────────────
    async function loadDashboard() {
        try {
            const [dashRes, studRes] = await Promise.all([
                fetch(`${API_BASE}/students/dashboard`),
                fetch(`${API_BASE}/students`)
            ]);
            const dashJson = await dashRes.json();
            const studJson = await studRes.json();

            if (!dashJson.success) throw new Error(dashJson.message);

            const { totalStudents, passed, failed, avgGWA } = dashJson.data;
            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('passedStudents').textContent = passed;
            document.getElementById('failedStudents').textContent = failed;
            document.getElementById('avgGWA').textContent = avgGWA.toFixed(2);

            updateChart(passed, failed);

            if (studJson.success) {
                updateGradesTable(studJson.data);
            }

        } catch (err) {
            showAlert('dashboardAlert', `⚠️ ${err.message}`, 'warning');
        }
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
                    backgroundColor: ['#0d7a4e', '#B8000E'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { weight: '600', size: 13 }, padding: 20 } }
                },
                animation: { animateRotate: true, duration: 800 }
            }
        });
    }

    function updateGradesTable(students) {
        const tbody = document.getElementById('gradesTableBody');
        if (!students || students.length === 0) {
            tbody.innerHTML = '<tr><t   d colspan="8" class="empty-row">No student records found.</td></tr>';
            return;
        }

        tbody.innerHTML = students.map(s => {
            const totalUnits = s.totalUnits || 0;
            const totalLec = s.totalLec || 0;
            const totalLab = s.totalLab || 0;
            const grades = s.grades || [];
            const passedCount = s.passedCount || 0;
            const gwa = (s.finalGWA || 0).toFixed(2);
            const allPassed = s.allPassed;

            // Get eligible subjects for next semester (uses cached prospectus)
            const passedCodes = grades.filter(g => g.passed).map(g => g.subjectCode.toUpperCase());
            const takenCodes = grades.map(g => g.subjectCode.toUpperCase());
            const eligible = prospectusCache.filter(sub => {
                const code = sub.code.toUpperCase();
                const taken = takenCodes.includes(code);
                const prereqsMet = (sub.prerequisites || []).every(p => passedCodes.includes(p.toUpperCase()));
                return !taken && prereqsMet;
            }).slice(0, 4);

            return `
                <tr>
                    <td><strong style="font-family:'Courier New',monospace;">${s.studentId}</strong></td>
                    <td>${s.name}</td>
                    <td>${passedCount}/${grades.length}</td>
                    <td>
                        <span style="font-weight:700;">${totalUnits}</span>
                        <small style="display:block;color:var(--text-muted);font-size:0.75rem;">(${totalLec}+${totalLab})</small>
                    </td>
                    <td><span class="gwa-display ${allPassed ? 'gwa-pass' : 'gwa-fail'}">${gwa}</span></td>
                    <td>${allPassed ? '<span class="status-pass">PASSED</span>' : '<span class="status-fail">FAILED</span>'}</td>
                    <td>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            ${eligible.length > 0
                    ? eligible.map(e => `<span class="prereq-tag met">${e.code}</span>`).join('') + (prospectusCache.filter(sub => !takenCodes.includes(sub.code.toUpperCase()) && (sub.prerequisites || []).every(p => passedCodes.includes(p.toUpperCase()))).length > 4 ? `<span class="prereq-tag pending">+more</span>` : '')
                    : '<span style="color:var(--text-muted);font-size:0.8rem;">—</span>'
                }
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="app.viewStudentDetail('${s.studentId}')">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ─── Student Lookup ────────────────────────────────────────────────────────
    async function searchStudent() {
        const query = document.getElementById('searchInput').value.trim();
        const resultsDiv = document.getElementById('searchResults');

        if (!query) {
            resultsDiv.innerHTML = '<div class="alert alert-error">Please enter a Student ID or Name</div>';
            return;
        }

        resultsDiv.innerHTML = '<div class="loading-spin"><div class="spinner"></div><p>Searching...</p></div>';

        try {
            const res = await fetch(`${API_BASE}/students/search/${encodeURIComponent(query)}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            const students = json.data;
            if (students.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3>No students found</h3>
                        <p>No matches for "${query}"</p>
                    </div>
                `;
                return;
            }

            let html = `<div class="alert alert-success">Found ${students.length} student(s)</div>`;
            students.forEach(s => {
                const grades = s.grades || [];
                const gwa = (s.finalGWA || 0).toFixed(2);

                // Group grades by subject code to handle history
                const grouped = {};
                grades.forEach(g => {
                    const code = g.subjectCode.toUpperCase();
                    if (!grouped[code]) grouped[code] = [];
                    grouped[code].push(g);
                });

                const subjectStates = Object.values(grouped).map(attempts => {
                    // Sort attempts: Passed one first if it exists, otherwise latest recorded
                    const hasPassed = attempts.find(a => a.passed);
                    const sorted = attempts.sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded));
                    const latest = hasPassed || sorted[0];
                    const history = attempts.filter(a => a._id !== latest._id);
                    return { latest, history };
                });

                const passed = subjectStates.filter(ss => ss.latest.status === 'PASSED');
                const failed = subjectStates.filter(ss => ss.latest.status === 'FAILED');
                const dropped = subjectStates.filter(ss => ss.latest.status === 'DROPPED');
                const inc = subjectStates.filter(ss => ss.latest.status === 'INC');
                const nt = subjectStates.filter(ss => ss.latest.status === 'NT');

                const passedCodes = passed.map(ss => ss.latest.subjectCode.toUpperCase());
                const takenCodes = subjectStates.map(ss => ss.latest.subjectCode.toUpperCase());

                const eligible = prospectusCache.filter(sub => {
                    const code = sub.code.toUpperCase();
                    return !takenCodes.includes(code) && (sub.prerequisites || []).every(p => passedCodes.includes(p.toUpperCase()));
                });

                const locked = prospectusCache.filter(sub => {
                    const code = sub.code.toUpperCase();
                    return !takenCodes.includes(code) && !(sub.prerequisites || []).every(p => passedCodes.includes(p.toUpperCase()));
                });

                const renderGradeCard = (ss, type) => {
                    const sub = ss.latest;
                    const historyHtml = ss.history.length > 0 ? `
                        <div class="grade-history" style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed #ddd; font-size:0.8rem;">
                            ${ss.history.map(h => `
                                <div style="color:var(--text-muted);">
                                    <span style="font-weight:600;">Previous Failed Grade:</span> 
                                    <span class="grade-badge grade-fail" style="transform:scale(0.8);">${h.gwa.toFixed(2)}</span> 
                                    (${h.schoolYear || 'N/A'})
                                </div>
                            `).join('')}
                        </div>` : '';

                    return `
                        <div class="enrollment-card ${type}">
                            <div class="subject-code">${sub.subjectCode}</div>
                            <div class="subject-name">${sub.subjectName}</div>
                            <div class="subject-meta">
                                <span class="meta-item units">Lec: ${sub.lec} | Lab: ${sub.lab} | Total: ${sub.units}</span>
                                <span class="meta-item" style="background:var(--bg-light);border:1px solid var(--border-light);">S.Y.: ${sub.schoolYear || '—'}</span>
                                <span class="grade-badge ${getGradeClass(sub.gwa)}">${sub.gwa.toFixed(2)}</span>
                            </div>
                            ${historyHtml}
                        </div>`;
                };

                const cardId = `lookup-card-${s.studentId.replace(/[^a-z0-9]/gi, '-')}`;
                const safeId = s.studentId.replace(/[^a-z0-9]/gi, '-');
                html += `
                    <div class="student-card" id="${cardId}">
                        <div class="student-header">
                            <div id="header-info-${safeId}">
                                <h2 class="student-name-text">${s.name}</h2>
                                <p class="student-id">
                                    ID: <span class="student-id-text">${s.studentId}</span> &nbsp;|&nbsp; 
                                    Program: <span style="font-weight:700;color:var(--cj-gold-dark);">${s.classifier !== 'NONE' && s.classifier ? s.classifier : 'N/A'}</span> 
                                    ${s.isABM ? '&nbsp;|&nbsp; <span class="abm-status-val" data-isabm="true" style="background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">ABM STUDENT</span>' : '<span class="abm-status-val" data-isabm="false" style="display:none;"></span>'}
                                    &nbsp;|&nbsp; Year ${s.yearLevel || '—'}
                                </p>
                            </div>
                            <div style="display: flex; gap: 0.5rem;" id="header-actions-${safeId}">
                                <button class="btn btn-sm btn-edit" style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;" onclick="app.toggleEditStudent('${s.studentId}')">✏️ Edit Info</button>
                                <button class="btn btn-sm" style="background:#f9f9f9;border:1px solid #ddd;color:#333;" onclick="app.printCard('${cardId}')">🖨️ Print</button>
                                <button class="btn btn-sm" style="background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;" onclick="app.downloadAsPDF('${cardId}', '${s.name}')">📄 Save to PDF</button>
                            </div>
                        </div>
                        
                        <details style="margin: 1rem 0; padding: 0.75rem; background: #fafafa; border-radius: var(--radius-md); border: 1px solid #eaeaea;"
                                 ontoggle="this.querySelector('summary').textContent = this.open ? 'Shrink Subjects Overview' : 'View Subjects Overview'">
                            <summary style="cursor: pointer; font-weight: 600; color: var(--text-color);">View Subjects Overview</summary>
                            <div style="margin-top: 1rem;">

                                <h3 class="section-header available" style="font-size: 0.95rem;">Passed (${passed.length})</h3>
                                <div class="enrollment-grid">
                                    ${passed.length > 0 ? passed.map(ss => renderGradeCard(ss, 'completed')).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                                <h3 class="section-header locked" style="font-size: 0.95rem;">Failed (${failed.length})</h3>
                                <div class="enrollment-grid">
                                    ${failed.length > 0 ? failed.map(ss => renderGradeCard(ss, 'locked')).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                                <h3 class="section-header" style="font-size: 0.95rem; color:#d97706;">Dropped (${dropped.length})</h3>
                                <div class="enrollment-grid">
                                    ${dropped.length > 0 ? dropped.map(ss => renderGradeCard(ss, 'locked')).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                                <h3 class="section-header" style="font-size: 0.95rem; color:#7c3aed;">Incomplete (${inc.length})</h3>
                                <div class="enrollment-grid">
                                    ${inc.length > 0 ? inc.map(ss => renderGradeCard(ss, 'locked')).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                                <h3 class="section-header" style="font-size: 0.95rem; color:#6b7280;">No Test / Exam (${nt.length})</h3>
                                <div class="enrollment-grid">
                                    ${nt.length > 0 ? nt.map(ss => renderGradeCard(ss, 'locked')).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                                <h3 class="section-header" style="font-size: 0.95rem;">Not Eligible (${locked.length})</h3>
                                <div class="enrollment-grid">
                                    ${locked.length > 0 ? locked.map(sub => `
                                        <div class="enrollment-card locked">
                                            <div class="subject-code">${sub.code}</div>
                                            <div class="subject-name">${sub.name}</div>
                                            <div class="subject-meta">
                                                <span class="meta-item units">Lec: ${sub.lec} | Lab: ${sub.lab} | Total: ${sub.units}</span>
                                            </div>
                                            ${(sub.prerequisites || []).length > 0 ? `
                                                <div class="prereq-section">
                                                    <small>Requires:</small>
                                                    <div class="prereq-list">
                                                        ${sub.code.toUpperCase() === 'PC710' ? '<span class="prereq-tag pending">Taken all subjects for the last 6 semesters (Including Summer).</span>' :
                            sub.code.toUpperCase() === 'PRAC802' ? '<span class="prereq-tag pending">Taken all subjects for the last 7 semesters and Research.(including Summer)</span>' :
                                sub.prerequisites.map(p => {
                                    const cls = passedCodes.includes(p.toUpperCase()) ? 'met' : takenCodes.includes(p.toUpperCase()) ? 'unmet' : 'pending';
                                    return `<span class="prereq-tag ${cls}">${p}</span>`;
                                }).join('')
                        }
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">None</p>'}
                                </div>

                            </div>
                        </details>
                    </div>
                `;
            });

            resultsDiv.innerHTML = html;
        } catch (err) {
            resultsDiv.innerHTML = `<div class="alert alert-error">❌ ${err.message}</div>`;
        }
    }

    async function checkEnrollmentEligibility() {
        const query = document.getElementById('enrollSearchInput').value.trim();
        const resultsDiv = document.getElementById('enrollmentResults');

        if (!query) {
            resultsDiv.innerHTML = '<div class="alert alert-error">Please enter a Student ID or Name</div>';
            return;
        }

        resultsDiv.innerHTML = '<div class="loading-spin"><div class="spinner"></div><p>Searching...</p></div>';

        try {
            const searchRes = await fetch(`${API_BASE}/students/search/${encodeURIComponent(query)}`);
            const searchJson = await searchRes.json();
            if (!searchJson.success) throw new Error(searchJson.message);

            const students = searchJson.data;
            if (students.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <h3>No records found</h3>
                        <p>No matches for "${query}"</p>
                    </div>
                `;
                return;
            }

            let html = `<div class="alert alert-success">Found ${students.length} student(s)</div>`;

            for (const student of students) {
                const eligRes = await fetch(`${API_BASE}/students/${encodeURIComponent(student.studentId)}/eligibility`);
                const eligJson = await eligRes.json();
                if (!eligJson.success) continue;

                const s = eligJson.data;
                const { available, locked, completed } = s.eligibility || { available: [], locked: [], completed: [] };
                const gwa = (s.finalGWA || 0).toFixed(2);

                const cardId = `enroll-card-${s.studentId.replace(/[^a-z0-9]/gi, '-')}`;
                html += `
                <div class="student-card" id="${cardId}" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #eaeaea; border-radius: var(--radius-md); background: #fff;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.25rem;">👤 ${s.name}</h2>
                            <p style="margin: 0.25rem 0 0; color: var(--text-muted);">
                                ID: ${s.studentId} &nbsp;|&nbsp; Program: <span style="font-weight:700;color:var(--cj-gold-dark);">${s.classifier !== 'NONE' && s.classifier ? s.classifier : 'N/A'}</span> &nbsp;|&nbsp; Year ${s.yearLevel || '—'}
                            </p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem; text-align: right;">
                            <div>
                                <div style="font-weight: bold; color: ${s.allPassed ? 'var(--cj-green)' : 'var(--cj-red)'}; font-size: 1.2rem;">GWA: ${gwa}</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);">${available.length} subject(s) available</div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button class="btn btn-sm" style="background:#f9f9f9;border:1px solid #ddd;color:#333;" onclick="app.printCard('${cardId}')">🖨️ Print</button>
                                <button class="btn btn-sm" style="background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;" onclick="app.downloadAsPDF('${cardId}', '${s.name}')">📄 Save to PDF</button>
                            </div>
                        </div>
                    </div>

                    <details style="margin-top: 1rem; border-top: 1px solid #eaeaea; padding-top: 1rem;"
                             ontoggle="this.querySelector('summary').textContent = this.open ? 'Shrink Available Subjects' : 'View Available Subjects (${available.length})'">
                        <summary class="btn btn-primary" style="display: inline-block; cursor: pointer; list-style: none;">
                            View Available Subjects (${available.length})
                        </summary>
                        ${available.length > 0 ? (() => {
                        const years = [1, 2, 3, 4];
                        const sems = [1, 2, 'summer'];
                        let semSections = '';
                        years.forEach(yr => {
                            sems.forEach(sem => {
                                const group = available.filter(sub => sub.year == yr && sub.sem === sem);
                                if (group.length === 0) return;
                                const yearLabel = yr === 1 ? '1st Year' : yr === 2 ? '2nd Year' : yr === 3 ? '3rd Year' : '4th Year';
                                const semLabel = sem === 1 ? 'First Semester' : sem === 2 ? 'Second Semester' : 'Summer';
                                const totalUnits = group.reduce((sum, sub) => sum + sub.units, 0);

                                // Group student grades by subject code for history
                                const studentGrades = s.grades || [];

                                semSections += `
                                        <div class="semester-section" style="margin-top: 1.5rem;">
                                            <div class="semester-title"> ${yearLabel} &nbsp;&bull;&nbsp; ${semLabel} <small style="font-weight:400;color:var(--text-muted);margin-left:auto;">${totalUnits} units available</small></div>
                                            <div class="table-container">
                                                <table class="prospectus-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Code</th>
                                                            <th>Subject Name</th>
                                                            <th style="text-align:center;">Lec</th>
                                                            <th style="text-align:center;">Lab</th>
                                                            <th style="text-align:center;">Units</th>
                                                            <th>Prerequisites</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${group.map(sub => {
                                    const code = sub.code.toUpperCase();
                                    return `
                                                            <tr>
                                                                <td class="code-cell">${sub.code}</td>
                                                                <td>${sub.name}</td>
                                                                <td style="text-align:center;">${sub.lec > 0 ? sub.lec : '—'}</td>
                                                                <td style="text-align:center;">${sub.lab > 0 ? sub.lab : '—'}</td>
                                                                <td style="text-align:center;"><strong>${sub.units}</strong></td>
                                                                <td>
                                                                    ${sub.code.toUpperCase() === 'PC710' ? '<span style="font-size:0.8rem;color:var(--cj-green);font-weight:500;">Taken all subjects for the last 6 semesters (Including Summer).</span>' :
                                            sub.code.toUpperCase() === 'PRAC802' ? '<span style="font-size:0.8rem;color:var(--cj-green);font-weight:500;">Taken all subjects for the last 7 semesters and Research.(including Summer)</span>' :
                                                ((sub.prerequisites || []).length > 0
                                                    ? sub.prerequisites.map(p => {
                                                        const isPassed = studentGrades.some(g => g.subjectCode.toUpperCase() === p.toUpperCase() && g.passed);
                                                        return `<span class="prereq-tag ${isPassed ? 'met' : 'unmet'}">${p}</span>`;
                                                    }).join(' ')
                                                    : '<span class="prereq-tag met" style="font-size:0.7rem;">None</span>')
                                        }
                                                                </td>
                                                            </tr>
                                                        `;
                                }).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    `;
                            });
                        });
                        return `<div style="margin-top: 1rem;">${semSections}</div>`;
                    })() : `
                        <div style="margin-top: 1rem; padding: 1rem; text-align: center; color: var(--text-muted);">
                            <p>No subjects available for enrollment at this time.</p>
                        </div>
                        `}
                    </details>
                </div>
                `;
            }

            resultsDiv.innerHTML = html;
        } catch (err) {
            resultsDiv.innerHTML = `<div class="alert alert-error">❌ ${err.message}</div>`;
        }
    }

    // ─── Grade Record ──────────────────────────────────────────────────────────
    function toggleEditStudent(studentId) {
        const safeId = studentId.replace(/[^a-z0-9]/gi, '-');
        const infoDiv = document.getElementById(`header-info-${safeId}`);
        const actionsDiv = document.getElementById(`header-actions-${safeId}`);

        if (!infoDiv || !actionsDiv) return;

        const nameText = infoDiv.querySelector('.student-name-text').textContent;
        const idText = infoDiv.querySelector('.student-id-text').textContent;
        const abmVal = infoDiv.querySelector('.abm-status-val')?.dataset.isabm === 'true';

        // Switch to Edit Mode
        infoDiv.innerHTML = `
            <div style="margin-bottom:0.5rem;">
                <label style="display:block;font-size:0.75rem;color:var(--text-muted);font-weight:600;">Student Name</label>
                <input type="text" class="form-control edit-name-input" value="${nameText}" style="font-size:1.1rem;font-weight:700;padding:4px 8px;width:100%;max-width:400px;margin-top:2px;" />
            </div>
            <div style="display:flex; gap:1rem; align-items:flex-end;">
                <div>
                    <label style="display:block;font-size:0.75rem;color:var(--text-muted);font-weight:600;">Student ID</label>
                    <input type="text" class="form-control edit-id-input" value="${idText}" style="font-family:'Courier New',monospace;padding:4px 8px;width:100%;max-width:250px;margin-top:2px;" />
                </div>
                <div style="margin-bottom:4px; display:flex; align-items:center; gap:0.5rem; background:#f0fdf4; padding:4px 10px; border-radius:6px; border:1px solid #bbf7d0;">
                    <input type="checkbox" id="edit-isABM-${safeId}" ${abmVal ? 'checked' : ''} style="cursor:pointer;" />
                    <label for="edit-isABM-${safeId}" style="cursor:pointer; font-size:0.85rem; font-weight:600; color:#166534;">ABM Student</label>
                </div>
            </div>
        `;

        actionsDiv.innerHTML = `
            <button class="btn btn-sm btn-success" onclick="app.updateStudentInfo('${studentId}')">💾 Save</button>
            <button class="btn btn-sm" style="background:#f3f4f6;border:1px solid #d1d5db;color:#374151;" onclick="app.searchStudent()">Cancel</button>
        `;
    }

    async function updateStudentInfo(oldStudentId) {
        const safeId = oldStudentId.replace(/[^a-z0-9]/gi, '-');
        const card = document.getElementById(`lookup-card-${safeId}`);
        if (!card) return;

        const newName = card.querySelector('.edit-name-input').value.trim();
        const newStudentId = card.querySelector('.edit-id-input').value.trim();
        const isABM = card.querySelector('input[type="checkbox"]').checked;

        if (!newName || !newStudentId) {
            showToast('Name and ID are required', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/students/${encodeURIComponent(oldStudentId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName, newStudentId, isABM })
            });
            const json = await res.json();

            if (!json.success) throw new Error(json.message);

            showToast('Student information updated successfully!', 'success');

            // Refresh search results
            const searchInput = document.getElementById('searchInput');
            if (searchInput.value.trim() === oldStudentId) {
                searchInput.value = newStudentId;
            }
            searchStudent();
        } catch (err) {
            console.error('Update error:', err);
            showToast(`Update failed: ${err.message}`, 'error');
        }
    }

    async function checkGradeRecord() {
        const query = document.getElementById('gradeRecordSearchInput').value.trim();
        const resultsDiv = document.getElementById('gradeRecordResults');

        if (!query) {
            resultsDiv.innerHTML = '<div class="alert alert-error">Please enter a Student ID or Name</div>';
            return;
        }

        resultsDiv.innerHTML = '<div class="loading-spin"><div class="spinner"></div><p>Searching...</p></div>';

        try {
            const res = await fetch(`${API_BASE}/students/search/${encodeURIComponent(query)}`);
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            const students = json.data;

            if (students.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3>No records found</h3>
                        <p>No matches for "${query}"</p>
                    </div>
                `;
                return;
            }

            let html = `<div class="alert alert-success">Found ${students.length} record(s)</div>`;

            students.forEach(s => {
                const grades = s.grades || [];
                const gwa = (s.finalGWA || 0).toFixed(2);
                const allPassed = s.allPassed;

                const years = [1, 2, 3, 4];
                const sems = [1, 2, 'summer'];
                let tablesHtml = '';

                years.forEach(year => {
                    sems.forEach(sem => {
                        const semProspectus = prospectusCache.filter(s => s.year == year && s.sem === sem);
                        if (semProspectus.length === 0) return;

                        const yearLabel = year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year';
                        const semLabel = sem === 1 ? 'First Semester' : sem === 2 ? 'Second Semester' : 'Summer';
                        const totalUnits = semProspectus.reduce((sum, s) => sum + s.units, 0);

                        tablesHtml += `
                            <div class="semester-section" style="margin-top: 1.5rem;">
                                <div class="semester-title">${yearLabel} &nbsp;&bull;&nbsp; ${semLabel} <small style="font-weight:400;color:var(--text-muted);margin-left:auto;">${totalUnits} units</small></div>
                                <div class="table-container">
                                    <table class="prospectus-table">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Subject Name</th>
                                                <th style="text-align:center;">S.Y.</th>
                                                <th style="text-align:center;">Lec</th>
                                                <th style="text-align:center;">Lab</th>
                                                <th style="text-align:center;">Total</th>
                                                <th style="text-align:center;">Grade</th>
                                                <th style="text-align:center;">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${semProspectus.map(sub => {
                            const code = sub.code.toUpperCase();
                            const attempts = grades.filter(g => g.subjectCode.toUpperCase() === code);

                            // Sort attempts: Passed one first, then latest record
                            const hasPassed = attempts.find(a => a.passed);
                            const sorted = attempts.sort((a, b) => new Date(b.dateRecorded) - new Date(a.dateRecorded));
                            const studentGrade = hasPassed || sorted[0];
                            const history = attempts.filter(a => a._id !== (studentGrade ? studentGrade._id : ''));

                            // Check for a lab grade entry for this subject
                            const labCode = code + ' LAB';
                            const labGradeEntry = grades.find(g => g.subjectCode.toUpperCase() === labCode);

                            const labRowHtml = labGradeEntry ? (() => {
                                const labDisp = getGradeDisplay(labGradeEntry.gwa, labGradeEntry.passed, labGradeEntry.status);
                                const labStatusCls = ['NT', 'INC', 'DROPPED'].includes(labGradeEntry.status) ? 'grade-special' : (labGradeEntry.passed ? 'pass' : 'fail');
                                // Always derive name from prospectus parent (avoids stale "Unknown Subject")
                                const labDisplayName = `${sub.name} Lab`;
                                return `
                                                    <tr style="background:#fffbea; border-left:3px solid rgba(212,160,23,0.6);">
                                                        <td class="code-cell" style="color:#92400e;font-size:0.8rem;padding-left:1.5rem;">${labGradeEntry.subjectCode}</td>
                                                        <td style="font-size:0.85rem;color:#78350f;font-style:italic;">${labDisplayName}</td>
                                                        <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">${labGradeEntry.schoolYear || '—'}</td>
                                                        <td style="text-align:center;">—</td>
                                                        <td style="text-align:center;">${labGradeEntry.lab > 0 ? labGradeEntry.lab : '—'}</td>
                                                        <td style="text-align:center;"><strong>${labGradeEntry.units}</strong></td>
                                                        <td style="text-align:center;"><span class="grade-cell ${labDisp.cls}">${labDisp.label}</span></td>
                                                        <td style="text-align:center;"><span class="status-cell ${labStatusCls}">${labGradeEntry.status}</span></td>
                                                    </tr>`;
                            })() : '';

                            if (studentGrade) {
                                const disp = getGradeDisplay(studentGrade.gwa, studentGrade.passed, studentGrade.status);
                                const statusCls = ['NT', 'INC', 'DROPPED'].includes(studentGrade.status) ? 'grade-special' : (studentGrade.passed ? 'pass' : 'fail');

                                const historyHtml = history.length > 0 ? `
                                    <div style="font-size:0.65rem; color:var(--text-muted); margin-top:4px; padding-top:2px; border-top:1px dashed #eee;">
                                        ${history.map(h => `
                                            <div title="${h.status}">Prev: <strong>${h.gwa.toFixed(2)}</strong> (${h.schoolYear || 'N/A'})</div>
                                        `).join('')}
                                    </div>
                                ` : '';

                                return `
                                                    <tr>
                                                        <td class="code-cell">${sub.code}</td>
                                                        <td>${sub.name}</td>
                                                        <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">${studentGrade.schoolYear || '—'}</td>
                                                        <td style="text-align:center;">${sub.lec > 0 ? sub.lec : '—'}</td>
                                                        <td style="text-align:center;">${sub.lab > 0 ? sub.lab : '—'}</td>
                                                        <td style="text-align:center;"><strong>${sub.units}</strong></td>
                                                        <td style="text-align:center;">
                                                            <span class="grade-cell ${disp.cls}">${disp.label}</span>
                                                            ${historyHtml}
                                                        </td>
                                                        <td style="text-align:center;"><span class="status-cell ${statusCls}">${studentGrade.status}</span></td>
                                                    </tr>
                                                    ${labRowHtml}`;
                            }
                            return `
                                                    <tr>
                                                        <td class="code-cell">${sub.code}</td>
                                                        <td>${sub.name}</td>
                                                        <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">—</td>
                                                        <td style="text-align:center;">${sub.lec > 0 ? sub.lec : '—'}</td>
                                                        <td style="text-align:center;">${sub.lab > 0 ? sub.lab : '—'}</td>
                                                        <td style="text-align:center;"><strong>${sub.units}</strong></td>
                                                        <td style="text-align:center;"><span style="color:var(--text-muted)">—</span></td>
                                                        <td style="text-align:center;"><span style="color:var(--text-muted)">—</span></td>
                                                    </tr>
                                                    ${labRowHtml}`;
                        }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    });
                });

                // Add any subjects found in grades that are NOT in prospectus (exclude lab sub-entries)
                const unknownGrades = grades.filter(g => {
                    const code = g.subjectCode.toUpperCase();
                    // Skip if it's a lab entry (will be shown inline below parent subject)
                    if (code.endsWith(' LAB')) return false;
                    return !prospectusCache.some(p => p.code.toUpperCase() === code);
                });
                if (unknownGrades.length > 0) {
                    tablesHtml += `
                            <div class="semester-section" style="margin-top: 1.5rem;">
                                <div class="semester-title">❓ Extra Subjects (Not in Prospectus)</div>
                                <div class="table-container">
                                    <table class="prospectus-table">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Subject Name</th>
                                                <th style="text-align:center;">S.Y.</th>
                                                <th style="text-align:center;">Lec</th>
                                                <th style="text-align:center;">Lab</th>
                                                <th style="text-align:center;">Total</th>
                                                <th style="text-align:center;">Grade</th>
                                                <th style="text-align:center;">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${unknownGrades.map(g => {
                        const disp = getGradeDisplay(g.gwa, g.passed, g.status);
                        const statusCls2 = ['NT', 'INC', 'DROPPED'].includes(g.status) ? 'grade-special' : (g.passed ? 'pass' : 'fail');
                        return `
                                                 <tr>
                                                     <td class="code-cell">${g.subjectCode}</td>
                                                     <td>${g.subjectName}</td>
                                                     <td style="text-align:center; font-size:0.85rem; color:var(--text-muted);">${g.schoolYear || '—'}</td>
                                                     <td style="text-align:center;">${g.lec > 0 ? g.lec : '\u2014'}</td>
                                                     <td style="text-align:center;">${g.lab > 0 ? g.lab : '\u2014'}</td>
                                                     <td style="text-align:center;"><strong>${g.units}</strong></td>
                                                     <td style="text-align:center;"><span class="grade-cell ${disp.cls}">${disp.label}</span></td>
                                                     <td style="text-align:center;"><span class="status-cell ${statusCls2}">${g.status}</span></td>
                                                 </tr>`;
                    }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                }

                const cardId = `graderecord-card-${s.studentId.replace(/[^a-z0-9]/gi, '-')}`;
                html += `
                    <div class="student-card" id="${cardId}" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #eaeaea; border-radius: var(--radius-md); background: #fff;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="margin: 0; font-size: 1.25rem;">👤 ${s.name}</h2>
                                <p style="margin: 0.25rem 0 0; color: var(--text-muted);">
                                    ID: ${s.studentId} &nbsp;|&nbsp; Program: <span style="font-weight:700;color:var(--cj-gold-dark);">${s.classifier !== 'NONE' && s.classifier ? s.classifier : 'N/A'}</span> &nbsp;|&nbsp; Year ${s.yearLevel || '—'}
                                </p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; text-align: right;">
                                <div style="font-weight: bold; color: ${allPassed ? 'var(--cj-green)' : 'var(--cj-red)'}; font-size: 1.2rem;">GWA: ${gwa}</div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm" style="background:#f9f9f9;border:1px solid #ddd;color:#333;" onclick="app.printCard('${cardId}')">🖨️ Print</button>
                                    <button class="btn btn-sm" style="background:#eef2ff;border:1px solid #c7d2fe;color:#3730a3;" onclick="app.downloadAsPDF('${cardId}', '${s.name}')">📄 Save to PDF</button>
                                </div>
                            </div>
                        </div>

                        <details style="margin-top: 1rem; border-top: 1px solid #eaeaea; padding-top: 1rem;"
                                 ontoggle="this.querySelector('summary').textContent = this.open ? 'Shrink Grade Record' : 'Expand Grade Record'">
                            <summary class="btn btn-primary" style="display: inline-block; cursor: pointer; list-style: none;">
                                Expand Grade Record
                            </summary>
                            
                            <div style="margin-top: 1.5rem;">
                                <div class="detail-stats-grid" style="margin-bottom:1rem;">
                                    <div class="detail-stat">
                                        <div class="detail-stat-value ${allPassed ? 'pass' : 'fail'}">${gwa}</div>
                                        <div class="detail-stat-label">Final GWA</div>
                                    </div>
                                    <div class="detail-stat">
                                        <div class="detail-stat-value">${s.totalLec || 0}</div>
                                        <div class="detail-stat-label">Lec Units</div>
                                    </div>
                                    <div class="detail-stat">
                                        <div class="detail-stat-value">${s.totalLab || 0}</div>
                                        <div class="detail-stat-label">Lab Units</div>
                                    </div>
                                    <div class="detail-stat">
                                        <div class="detail-stat-value">${s.totalUnits || 0}</div>
                                        <div class="detail-stat-label">Total Units</div>
                                    </div>
                                    <div class="detail-stat">
                                        <div class="detail-stat-value">${s.passedCount || 0}/${grades.length}</div>
                                        <div class="detail-stat-label">Passed</div>
                                    </div>
                                </div>

                                <h3 style="margin-bottom:var(--space-sm);color:var(--cj-red-dark); margin-top: 2rem;">Full Grades Breakdown</h3>
                                ${tablesHtml}
                            </div>
                        </details>
                    </div>
                `;
            });
            resultsDiv.innerHTML = html;
        } catch (err) {
            resultsDiv.innerHTML = `<div class="alert alert-error">❌ ${err.message}</div>`;
        }
    }

    function openGradeRecord(studentId) {
        document.getElementById('tab-graderecord').click();
        document.getElementById('gradeRecordSearchInput').value = studentId;
        checkGradeRecord();
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────
    function getGradeClass(gwa) {
        if (gwa === 9 || gwa === 8) return 'grade-special';
        if (gwa === 7) return 'grade-dropped';
        if (gwa <= 1.75) return 'grade-excellent';
        if (gwa <= 2.50) return 'grade-good';
        if (gwa <= 3.00) return 'grade-fair';
        if (gwa <= 4.00) return 'grade-poor';
        return 'grade-fail';
    }

    function showAlert(elementId, message, type = 'info') {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => { if (el) el.innerHTML = ''; }, 6000);
    }

    function showToast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function printCard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Auto-expand all details for capturing full content
        const details = element.querySelectorAll('details');
        const originalStates = Array.from(details).map(d => d.open);
        details.forEach(d => d.open = true);

        // Add printing classes
        document.body.classList.add('printing-specific-card');
        element.classList.add('print-target');

        // Trigger print
        window.print();

        // Cleanup
        document.body.classList.remove('printing-specific-card');
        element.classList.remove('print-target');

        // Restore details to original state
        details.forEach((d, i) => d.open = originalStates[i]);
    }

    async function downloadAsPDF(elementId, studentName = 'Student_Record') {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Auto-expand all details for capturing full content
        const details = element.querySelectorAll('details');
        const originalStates = Array.from(details).map(d => d.open);
        details.forEach(d => d.open = true);

        // Give it a moment to reflow for accurate capture
        await new Promise(resolve => setTimeout(resolve, 500));

        const safeName = studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const opt = {
            margin: 10,
            filename: `${safeName}_report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0,
                scrollX: 0
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            showToast('Generating PDF...', 'info');
            await html2pdf().set(opt).from(element).save();
            showToast('PDF downloaded successfully!', 'success');
        } catch (err) {
            console.error('PDF error:', err);
            showToast('Error generating PDF', 'error');
        } finally {
            // Restore details to original state
            details.forEach((d, i) => d.open = originalStates[i]);
        }
    }

    // ─── Init ──────────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);

    return {
        addSubjectRow,
        submitGrades,
        clearGradeForm,
        formatStudentId,
        searchStudent,
        checkEnrollmentEligibility,
        checkGradeRecord,
        openGradeRecord,
        updateGradeCenterRows,
        downloadAsPDF,
        printCard,
        filterProspectus,
        toggleEditStudent,
        updateStudentInfo
    };
})();
