const { Queue, Worker } = require('bullmq');
const exceljs = require('exceljs');
const Student = require('../models/Student');
const Application = require('../models/Application');
const Recruiter = require('../models/Recruiter');
const { uploadToCloudinary } = require('./cloudinary');
const { emailQueue } = require('./emailQueue');
const logger = require('./logger');

const IORedis = require('ioredis');

const config = require('../config/config');

const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 100, 3000); // Reconnect after max 3 seconds
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
};

const connection = new IORedis(config.get('redis.url'), redisOptions);

let dataExportQueue;
let dataExportWorker;

if (config.get('env') !== 'test') {
    dataExportQueue = new Queue('data-export-queue', { connection });

    dataExportWorker = new Worker('data-export-queue', async (job) => {
        try {
            const { adminEmail, exportType, userIds } = job.data;
            logger.info(`Processing Data Export job ${job.id} for ${exportType}`);

            const workbook = new exceljs.Workbook();
            workbook.creator = 'Placement Management System';
            const worksheet = workbook.addWorksheet(exportType.toUpperCase());

            let dataCursor;

            // Configure Workbook Columns and Fetch Data Cursor
            if (exportType === 'students') {
                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Branch', key: 'branch', width: 15 },
                    { header: 'CGPA', key: 'cgpa', width: 10 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Graduation Year', key: 'gradYear', width: 18 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: '10th Marks', key: 'marks10', width: 12 },
                    { header: '12th Marks', key: 'marks12', width: 12 },
                    { header: 'Active Backlogs', key: 'backlogs', width: 15 }
                ];

                const query = userIds && userIds.length > 0 ? { _id: { $in: userIds } } : {};
                dataCursor = Student.find(query).lean().cursor();
            } else if (exportType === 'applications') {
                worksheet.columns = [
                    { header: 'Application ID', key: 'appId', width: 30 },
                    { header: 'Student Name', key: 'studentName', width: 25 },
                    { header: 'Student Email', key: 'studentEmail', width: 30 },
                    { header: 'Job Title', key: 'jobTitle', width: 25 },
                    { header: 'Company', key: 'company', width: 25 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Applied On', key: 'appliedOn', width: 20 }
                ];

                const query = userIds && userIds.length > 0 ? { _id: { $in: userIds } } : {};
                dataCursor = Application.find(query).populate('job_id').populate('student_id').lean().cursor();
            } else if (exportType === 'recruiters') {
                worksheet.columns = [
                    { header: 'Company Name', key: 'companyName', width: 25 },
                    { header: 'Contact Person', key: 'contactPerson', width: 25 },
                    { header: 'Email', key: 'email', width: 30 },
                    { header: 'Phone', key: 'phone', width: 15 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Registered On', key: 'created_at', width: 20 }
                ];

                const query = userIds && userIds.length > 0 ? { _id: { $in: userIds } } : {};
                dataCursor = Recruiter.find(query).lean().cursor();
            } else {
                throw new Error('Unknown export type');
            }

            // Style the header row
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            };
            worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

            let rowCount = 0;
            let totalCgpa = 0;

            // Pump MongoDB cursor to Excel Worksheet
            for await (const doc of dataCursor) {
                if (exportType === 'students') {
                    worksheet.addRow({
                        name: doc.name,
                        email: doc.email,
                        branch: doc.branch,
                        cgpa: doc.cgpa,
                        status: doc.status,
                        gradYear: doc.graduation_year,
                        phone: doc.phone,
                        marks10: doc.marks_10th,
                        marks12: doc.marks_12th,
                        backlogs: doc.backlogs_active
                    });
                    totalCgpa += (doc.cgpa || 0);
                    rowCount++;
                } else if (exportType === 'applications') {
                    worksheet.addRow({
                        appId: doc._id.toString(),
                        studentName: doc.student_id?.name || 'N/A',
                        studentEmail: doc.student_id?.email || 'N/A',
                        jobTitle: doc.job_id?.title || 'N/A',
                        company: doc.job_id?.company_name || 'N/A',
                        status: doc.status,
                        appliedOn: new Date(doc.applied_at).toLocaleDateString()
                    });
                } else if (exportType === 'recruiters') {
                    worksheet.addRow({
                        companyName: doc.company_name,
                        contactPerson: doc.contact_person,
                        email: doc.email,
                        phone: doc.phone,
                        status: doc.status,
                        created_at: new Date(doc.created_at).toLocaleDateString()
                    });
                }
            }

            // Add calculated summary row for students
            if (exportType === 'students' && rowCount > 0) {
                const avgCgpa = (totalCgpa / rowCount).toFixed(2);
                const summaryRow = worksheet.addRow({
                    name: 'AVERAGE CGPA ->',
                    cgpa: avgCgpa
                });
                summaryRow.font = { bold: true, color: { argb: 'FF000000' } };
                summaryRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF00' }
                };
            }

            // Generate buffer
            const excelBuffer = await workbook.xlsx.writeBuffer();

            // Format dynamic file name for Cloudinary
            const timestamp = new Date().getTime();
            const publicId = `PMS_${exportType.toUpperCase()}_Export_${timestamp}.xlsx`;

            // Upload Excel file directly to Cloudinary
            const uploadResult = await uploadToCloudinary(excelBuffer, 'exports', 'raw', publicId);

            // Add an email to the queue to send the download link to the admin
            await emailQueue.add('export-ready-email', {
                email: adminEmail,
                subject: `Your ${exportType.toUpperCase()} Report is Ready`,
                template: 'dataExport',
                context: {
                    name: 'Admin',
                    format: exportType,
                    downloadLink: uploadResult.secure_url
                }
            });

            logger.info(`Successfully processed Data Export ${job.id}`);
        } catch (err) {
            logger.error(`Export failed: ${err.message}`);
            throw err;
        }
    }, { connection });

    dataExportWorker.on('completed', job => {
        logger.info(`Export job ${job.id} has completed!`);
    });

    dataExportWorker.on('failed', (job, err) => {
        logger.error(`Export job ${job.id} has failed with ${err.message}`);
    });
} else {
    dataExportQueue = {
        add: async (name, payload) => {
            logger.info(`[TEST MOCK] Simulated adding Data Export task`);
        }
    };
}

module.exports = { dataExportQueue, dataExportWorker };
