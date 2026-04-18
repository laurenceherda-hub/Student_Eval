require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./models/Subject');

const prospectusData = [
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
    // Prerequisites: Must have taken all subjects from the first 6 semesters (Y1S1, Y1S2, Y1Summer, Y2S1, Y2S2, Y2Summer, Y3S1, Y3S2, Y3Summer)
    {
        code: 'PC710', name: 'Research in Hospitality', lec: 2, lab: 1, units: 3, year: 4, sem: 1, prerequisites: [
            'GenEd1', 'GenEd2', 'GenEd5', 'PC101', 'THC102', 'NSTP1', 'PE1', 'RS1', 'SC1',
            'GenEd3', 'GenEd4', 'CBME201', 'PC202', 'THC201', 'NSTP2', 'PE2', 'SC2', 'RS2',
            'PCE107', 'GenEd6', 'GenEd10',
            'CBME302', 'GenEd7', 'GenEd8', 'THC303', 'PC303', 'PCE306', 'PE3', 'RS3', 'SC3',
            'THC404', 'GenEd9', 'GenEd12', 'PC404', 'PCE428', 'THC405', 'PE4', 'RS4', 'Driving',
            'Practicum401',
            'PC505', 'THC509', 'PC506', 'PCE204', 'PC508', 'THC510', 'GenEd11', 'SC4',
            'THC608', 'PC609', 'THC607', 'THC606', 'PC607', 'PCE610', 'SC5',
            'Practicum601'
        ]
    },

    // FOURTH YEAR - Second Semester (6 total units)
    // Prerequisites: Must have taken all subjects from the first 7 semesters + Research (PC710)
    {
        code: 'PRAC802', name: 'Practicum (Minimum of 600 hours)', lec: 0, lab: 6, units: 6, year: 4, sem: 2, prerequisites: [
            'GenEd1', 'GenEd2', 'GenEd5', 'PC101', 'THC102', 'NSTP1', 'PE1', 'RS1', 'SC1',
            'GenEd3', 'GenEd4', 'CBME201', 'PC202', 'THC201', 'NSTP2', 'PE2', 'SC2', 'RS2',
            'PCE107', 'GenEd6', 'GenEd10',
            'CBME302', 'GenEd7', 'GenEd8', 'THC303', 'PC303', 'PCE306', 'PE3', 'RS3', 'SC3',
            'THC404', 'GenEd9', 'GenEd12', 'PC404', 'PCE428', 'THC405', 'PE4', 'RS4', 'Driving',
            'Practicum401',
            'PC505', 'THC509', 'PC506', 'PCE204', 'PC508', 'THC510', 'GenEd11', 'SC4',
            'THC608', 'PC609', 'THC607', 'THC606', 'PC607', 'PCE610', 'SC5',
            'Practicum601',
            'PC710'
        ]
    }
];

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
