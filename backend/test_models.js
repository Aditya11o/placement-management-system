const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const RecruiterProfile = require('./models/RecruiterProfile');
const CompanyProfile = require('./models/CompanyProfile');
const AdminProfile = require('./models/AdminProfile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Interview = require('./models/Interview');
const Notification = require('./models/Notification');
const Report = require('./models/Report');

dotenv.config();

const testModels = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for model testing...');

    // 1. Create a User (Recruiter)
    const recruiterUser = await User.findOneAndUpdate(
      { email: 'recruiter_test@pms.com' },
      { name: 'John Recruiter', password: 'Password@123', role: 'recruiter' },
      { upsert: true, new: true }
    );

    // 2. Create a Company
    const company = await CompanyProfile.findOneAndUpdate(
      { company_name: 'Google' },
      { 
        company_id: 'COMP001',
        recruiter_id: recruiterUser._id,
        company_name: 'Google', 
        website: 'https://google.com', 
        description: 'Tech Giant', 
        industry: 'Software',
        location: 'Mountain View, CA',
        hr_name: 'Sundar HR',
        hr_email: 'hr@google.com',
        hr_phone: '1234567890'
      },
      { upsert: true, new: true }
    );
    console.log('✅ CompanyProfile Verified');

    // 3. Create Recruiter Profile
    const recruiterProfile = await RecruiterProfile.findOneAndUpdate(
      { user: recruiterUser._id },
      { 
        user: recruiterUser._id, 
        company: company._id, 
        recruiter_id: 'REC001',
        full_name: 'John Recruiter',
        email: 'recruiter_test@pms.com',
        phone: '1234567890',
        password: 'Password@123',
        designation: 'HR Manager'
      },
      { upsert: true, new: true }
    );
    console.log('✅ RecruiterProfile Verified');

    // 4. Create a Job
    const job = await Job.findOneAndUpdate(
       { job_id: 'JOB001' },
       {
          job_id: 'JOB001',
          company_id: company._id,
          title: 'Software Engineer',
          role: 'Full Stack Developer',
          description: 'Develop awesome apps',
          skills_required: ['React', 'NodeJS'],
          min_cgpa: 7.0,
          course: 'B.Tech',
          job_type: 'Full-time',
          location: 'Bangalore',
          salary: '15 LPA',
          last_date: new Date(Date.now() + 86400000),
          openings: 5,
          status: 'Open'
       },
       { upsert: true, new: true }
    );
    console.log('✅ Job Verified');

    // 5. Create a Student User & Profile
    const studentUser = await User.findOneAndUpdate(
      { email: 'student_test@pms.com' },
      { name: 'Jane Student', password: 'Password@123', role: 'student' },
      { upsert: true, new: true }
    );

    const studentProfile = await StudentProfile.findOneAndUpdate(
      { user: studentUser._id },
      { 
        user: studentUser._id, 
        student_id: 'STU001',
        full_name: 'Jane Student',
        email: 'student_test@pms.com',
        phone: '9876543210',
        password: 'Password@123',
        course: 'B.Tech', 
        department: 'CSE', 
        semester: 8,
        cgpa: 8.5, 
        tenth_marks: 90,
        twelfth_marks: 88,
        passing_year: 2025 
      },
      { upsert: true, new: true }
    );
    console.log('✅ StudentProfile Verified');

    // 6. Create an Application
    const application = await Application.findOneAndUpdate(
      { application_id: 'APP001' },
      {
        application_id: 'APP001',
        student_id: studentUser._id,
        job_id: job._id,
        resume: 'https://resume.com/jane',
        status: 'Applied'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Application Verified');

    // 7. Create an Interview
    const interview = await Interview.findOneAndUpdate(
      { interview_id: 'INT001' },
      {
        interview_id: 'INT001',
        application_id: application._id,
        interview_date: new Date(Date.now() + 172800000),
        interview_time: '11:00 AM',
        mode: 'Online',
        meeting_link: 'https://zoom.us/test',
        status: 'Scheduled'
      },
       { upsert: true, new: true }
    );
    console.log('✅ Interview Verified');

    // 8. Create a Notification
    const notification = await Notification.findOneAndUpdate(
       { notification_id: 'NOT001' },
       {
          notification_id: 'NOT001',
          user_type: 'Student',
          user_id: studentUser._id,
          title: 'Interview Scheduled',
          message: 'Your interview is scheduled for tomorrow.',
          is_read: false
       },
       { upsert: true, new: true }
    );
    console.log('✅ Notification Verified');

    // 9. Create a Report (Placement Report)
    const report = await Report.findOneAndUpdate(
       { report_id: 'REP001' },
       {
          report_id: 'REP001',
          student_id: studentUser._id,
          company_id: company._id,
          job_id: job._id,
          package: '15 LPA',
          placement_date: new Date(),
          status: 'Accepted'
       },
       { upsert: true, new: true }
    );
    console.log('✅ Report Verified');

    // 10. Create an Admin User & Profile
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin_test@pms.com' },
      { name: 'Admin One', password: 'Password@123', role: 'admin' },
      { upsert: true, new: true }
    );

    const adminProfile = await AdminProfile.findOneAndUpdate(
      { user: adminUser._id },
      { 
        user: adminUser._id, 
        admin_id: 'ADM001',
        full_name: 'Admin One',
        email: 'admin_test@pms.com',
        phone: '1234567890',
        password: 'Password@123',
        role: 'Super Admin'
      },
      { upsert: true, new: true }
    );
    console.log('✅ AdminProfile Verified');

    console.log('\n🚀 ALL MODELS VERIFIED SUCCESSFULLY!');
    
    // Cleanup test data (Skip cleanup to see data in Compass if needed, but per rule we should clean up)
    await Job.deleteOne({ _id: job._id });
    await Application.deleteOne({ _id: application._id });
    await Interview.deleteOne({ _id: interview._id });
    await Notification.deleteOne({ _id: notification._id });
    await Report.deleteOne({ _id: report._id });
    await AdminProfile.deleteOne({ _id: adminProfile._id });

    process.exit(0);
  } catch (error) {
    console.error('❌ Model Verification Failed:', error.message);
    process.exit(1);
  }
};

testModels();
