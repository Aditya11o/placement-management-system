require('dotenv').config();
const mongoose = require('mongoose');
const EmailTemplate = require('../src/models/EmailTemplate');
const { getEmailTemplates, updateEmailTemplate } = require('../src/controllers/adminController');

async function testEmailTemplateCRUD() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Clear existing templates to start fresh
        await EmailTemplate.deleteMany({});
        console.log('Cleared existing templates');

        // 2. Test Auto-seed via GET request mock
        console.log('Testing GET (Auto-seed)...');
        let getResData = null;
        let getStatusCode = null;
        const mockGetReq = {};
        const mockGetRes = {
            status: function (code) { getStatusCode = code; return this; },
            json: function (data) { getResData = data; return this; }
        };
        const mockNext = (err) => { console.error('Next called with error:', err); };

        await getEmailTemplates(mockGetReq, mockGetRes, mockNext);
        console.log(`GET Response Status: ${getStatusCode}`);
        console.log(`Auto-seeded ${getResData?.count} templates`);

        if (getResData?.count < 2) throw new Error('Failed to auto-seed templates');

        const testTemplate = getResData.data[0];

        // 3. Test UPDATE request mock
        console.log(`\nTesting PUT for template: ${testTemplate.name}...`);
        let putResData = null;
        let putStatusCode = null;
        const mockPutReq = {
            params: { id: testTemplate._id.toString() },
            body: { subject: 'Modified Subject from Script', htmlContent: '<p>Modified body.</p>' }
        };
        const mockPutRes = {
            status: function (code) { putStatusCode = code; return this; },
            json: function (data) { putResData = data; return this; }
        };

        await updateEmailTemplate(mockPutReq, mockPutRes, mockNext);
        console.log(`PUT Response Status: ${putStatusCode}`);
        console.log(`Updated Subject: ${putResData?.data?.subject}`);

        if (putResData?.data?.subject !== 'Modified Subject from Script') throw new Error('Failed to update template');

        console.log('\n✅ CRUD Tests Passed successfully!');

    } catch (e) {
        console.error('❌ Test Failed:', e.message);
    } finally {
        await mongoose.disconnect();
    }
}

testEmailTemplateCRUD();
