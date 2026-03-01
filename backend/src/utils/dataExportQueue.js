const { Queue, Worker } = require('bullmq');
const exceljs = require('exceljs');
const Student = require('../models/Student');
const Application = require('../models/Application');
const { uploadToCloudinary } = require('./cloudinary');
const { emailQueue } = require('./emailQueue');
const logger = require('./logger');

const IORedis = require('ioredis');

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

const connection = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, redisOptions)
    : new IORedis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        ...redisOptions
    });

let dataExportQueue;
let dataExportWorker;

if (process.env.NODE_ENV !== 'test') {
    dataExportQueue = new Queue('data-export-queue', { connection });

    dataExportWorker = new Worker('data-export-queue', async (job) => {
        try {
            const { adminEmail, exportType } = job.data;
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

                dataCursor = Student.find().lean().cursor();
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

                dataCursor = Application.find().populate('job_id').populate('student_id').lean().cursor();
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
                        appliedOn: new Date(doc.created_at).toLocaleDateString()
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
                email: job.data.email,
                subject: `Your ${job.data.format.toUpperCase()} Report is Ready`,
                template: 'dataExport',
                context: {
                    name: 'Admin',
                    format: job.data.format,
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

module.exports = { dataExportQueue };
