const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const RecruiterProfile = require('./models/RecruiterProfile');
const CompanyProfile = require('./models/CompanyProfile');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const recruiter = await User.findOne({ email: 'recruiter_new@pms.com' });
        if (!recruiter) {
            console.log('Recruiter user not found');
            process.exit(1);
        }

        // 1. Create/Update Company Profile
        const companyData = {
            company_id: 'COMP-' + recruiter._id.toString().slice(-4).toUpperCase(),
            recruiter_id: recruiter._id,
            company_name: 'Academic Authority Corp',
            website: 'https://academicauthority.edu',
            description: 'Leading the future of academic excellence and placement management systems worldwide.',
            industry: 'Software & Technology',
            company_size: '501 - 1,000 employees',
            location: 'San Francisco, CA',
            hr_name: recruiter.name,
            hr_email: recruiter.email,
            hr_phone: '+1 (555) 902-1234'
        };

        let company = await CompanyProfile.findOne({ recruiter_id: recruiter._id });
        if (company) {
            Object.assign(company, companyData);
            await company.save();
            console.log('Company Profile updated');
        } else {
            company = new CompanyProfile(companyData);
            await company.save();
            console.log('Company Profile created');
        }

        // 2. Create/Update Recruiter Profile
        const recruiterProfileData = {
            user: recruiter._id,
            company: company._id,
            recruiter_id: 'REC-' + recruiter._id.toString().slice(-4).toUpperCase(),
            full_name: recruiter.name,
            email: recruiter.email,
            phone: '+1 (555) 902-1234',
            password: recruiter.password, // This is just for seeding, usually not exposed
            designation: 'Senior Talent Acquisition Manager',
            status: 'Active'
        };

        let rProfile = await RecruiterProfile.findOne({ user: recruiter._id });
        if (rProfile) {
            Object.assign(rProfile, recruiterProfileData);
            await rProfile.save();
            console.log('Recruiter Profile updated');
        } else {
            rProfile = new RecruiterProfile(recruiterProfileData);
            await rProfile.save();
            console.log('Recruiter Profile created');
        }

        process.exit(0);
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seed();
