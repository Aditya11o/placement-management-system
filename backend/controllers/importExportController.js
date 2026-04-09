const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const { Readable } = require('stream');

// @desc    Bulk Import Students from CSV
// @route   POST /api/admin/import/students
// @access  Private (Admin)
const importStudents = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const students = [];
    const stream = Readable.from(req.file.buffer);

    stream
      .pipe(csv())
      .on('data', (data) => students.push(data))
      .on('end', async () => {
        try {
          const results = {
            success: 0,
            skipped: 0,
            errors: []
          };

          const defaultPassword = 'Welcome@PMS';
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(defaultPassword, salt);

          for (const studentData of students) {
            const { name, email, course, branch, passingYear, cgpa, rollNo } = studentData;

            if (!email || !name) {
              results.errors.push(`Row missing name or email: ${JSON.stringify(studentData)}`);
              continue;
            }

            // Check if user exists
            const exists = await prisma.user.findUnique({ where: { email } });
            if (exists) {
              results.skipped++;
              continue;
            }

            // Create User + StudentProfile in a transaction
            await prisma.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                role: 'student',
                status: 'active',
                isVerified: true,
                studentProfile: {
                  create: {
                    rollNo: rollNo || null,
                    course: course || 'B.Tech',
                    branch: branch || 'CSE',
                    passingYear: parseInt(passingYear) || new Date().getFullYear(),
                    cgpa: parseFloat(cgpa) || 0.0,
                    academicVerified: true
                  }
                }
              }
            });
            results.success++;
          }

          res.json({
            message: `Import completed. Successful: ${results.success}, Skipped (Existing): ${results.skipped}`,
            results
          });
        } catch (error) {
          next(error);
        }
      });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Students to CSV
// @route   GET /api/admin/export/students
// @access  Private (Admin)
const exportStudents = async (req, res, next) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        studentProfile: true
      }
    });

    const fields = [
      'name', 'email', 'status', 'isVerified',
      'studentProfile.course', 'studentProfile.branch', 
      'studentProfile.passingYear', 'studentProfile.cgpa',
      'studentProfile.placementStatus'
    ];

    const flattened = students.map(s => ({
      name: s.name,
      email: s.email,
      status: s.status,
      isVerified: s.isVerified,
      'studentProfile.course': s.studentProfile?.course,
      'studentProfile.branch': s.studentProfile?.branch,
      'studentProfile.passingYear': s.studentProfile?.passingYear,
      'studentProfile.cgpa': s.studentProfile?.cgpa,
      'studentProfile.placementStatus': s.studentProfile?.placementStatus
    }));

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(flattened);

    res.header('Content-Type', 'text/csv');
    res.attachment('students_export.csv');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Export Placement Report to CSV
// @route   GET /api/admin/export/placements
// @access  Private (Admin)
const exportPlacements = async (req, res, next) => {
  try {
    const placements = await prisma.application.findMany({
      where: { status: { in: ['Selected', 'Accepted'] } },
      include: {
        student: { 
          include: { user: { select: { name: true, email: true } } } 
        },
        job: { select: { title: true, companyName: true, salary: true } }
      }
    });

    const fields = [
      'studentName', 'studentEmail', 'company', 'jobTitle', 'salary', 'status', 'appliedAt'
    ];

    const data = placements.map(p => ({
      studentName: p.student.user.name,
      studentEmail: p.student.user.email,
      company: p.job.companyName,
      jobTitle: p.job.title,
      salary: p.job.salary,
      status: p.status,
      appliedAt: p.createdAt
    }));

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('placements_report.csv');
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importStudents,
  exportStudents,
  exportPlacements
};
