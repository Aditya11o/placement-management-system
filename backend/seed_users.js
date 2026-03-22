const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const CompanyProfile = require('./models/CompanyProfile');
const Job = require('./models/Job');

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pms';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // 1. Clear existing data
    await User.deleteMany({});
    await CompanyProfile.deleteMany({});
    await Job.deleteMany({});
    console.log('Cleared existing data.');

    // 2. Create Users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@pms.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      },
      {
        name: 'Student User',
        email: 'student@pms.com',
        password: 'Student@123',
        role: 'student',
        isVerified: true
      },
      {
        name: 'Recruiter User',
        email: 'recruiter@pms.com',
        password: 'Recruiter@123',
        role: 'recruiter',
        isVerified: true
      }
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    const admin = createdUsers.find(u => u.role === 'admin');
    const student = createdUsers.find(u => u.role === 'student');
    const recruiter = createdUsers.find(u => u.role === 'recruiter');

    // 3. Create Company Profile for Recruiter
    const company = await CompanyProfile.create({
      company_id: 'COMP001',
      recruiter_id: recruiter._id,
      company_name: 'TechCorp Solutions',
      company_logo: 'https://via.placeholder.com/150',
      website: 'https://techcorp.example.com',
      description: 'A leading technology solutions provider specializing in AI and cloud computing.',
      industry: 'Technology',
      company_size: '500-1000',
      location: 'Bangalore, India',
      hr_name: 'Jane Doe',
      hr_email: 'jane.doe@techcorp.example.com',
      hr_phone: '1234567890'
    });
    console.log('Created Company Profile: TechCorp Solutions');

    // 4. Create Jobs
    const jobs = [
      {
        job_id: 'JOB001',
        company_id: company._id,
        title: 'Software Engineer',
        role: 'SDE-1',
        description: 'Join our team to build scalable web applications using React and Node.js.',
        skills_required: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
        min_cgpa: 7.5,
        course: 'B.Tech',
        job_type: 'Full-time',
        location: 'Remote',
        salary: '12 LPA',
        last_date: new Date('2026-05-30'),
        openings: 5,
        status: 'Open'
      },
      {
        job_id: 'JOB002',
        company_id: company._id,
        title: 'Backend Intern',
        role: 'Backend Intern',
        description: 'Work with our backend team to optimize API performance and database queries.',
        skills_required: ['Node.js', 'Express', 'SQL', 'Python'],
        min_cgpa: 7.0,
        course: 'B.Tech/M.Tech',
        job_type: 'Internship',
        location: 'Bangalore',
        salary: '35k/month',
        last_date: new Date('2026-04-15'),
        openings: 2,
        status: 'Open'
      },
      {
        job_id: 'JOB003',
        company_id: company._id,
        title: 'Frontend Developer',
        role: 'UI/UX Developer',
        description: 'Design and implement beautiful user interfaces using Tailwind CSS and React.',
        skills_required: ['React', 'Tailwind CSS', 'Figma'],
        min_cgpa: 6.5,
        course: 'B.CA/B.Tech',
        job_type: 'Full-time',
        location: 'Hyderabad',
        salary: '8 LPA',
        last_date: new Date('2026-06-10'),
        openings: 3,
        status: 'Open'
      }
    ];

    for (const jobData of jobs) {
      await Job.create(jobData);
      console.log(`Created job: ${jobData.title}`);
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
