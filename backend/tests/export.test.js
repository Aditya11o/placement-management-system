const { Worker } = require('bullmq');
const mongoose = require('mongoose');
const exceljs = require('exceljs');
const Student = require('../src/models/Student');
const Application = require('../src/models/Application');
const Job = require('../src/models/Job');
const { uploadToCloudinary } = require('../src/utils/cloudinary');
const { emailQueue } = require('../src/utils/emailQueue');

// We test the worker logic directly by bypassing BullMQ Redis dependencies for speed
// We will extract the exact logic inside the dataExportWorker
jest.mock('bullmq');
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
}));
jest.mock('../src/utils/cloudinary');
jest.mock('../src/utils/emailQueue', () => ({
    emailQueue: { add: jest.fn() }
}));
jest.mock('../src/config/config', () => ({
    get: jest.fn((key) => {
        if (key === 'env') return 'development';
        if (key === 'redis.url') return 'redis://localhost:6379';
        return null;
    })
}));

describe('Data Export Queue (ExcelJS Worker)', () => {
    let workerCallback;

    beforeAll(async () => {
        // Mock mongoose models
        Student.find = jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
                cursor: jest.fn().mockReturnValue(
                    (async function* () {
                        yield {
                            _id: new mongoose.Types.ObjectId(),
                            name: 'Test Student',
                            email: 'test@student.com',
                            branch: 'CSE',
                            cgpa: 9.5,
                            status: 'APPROVED',
                            graduation_year: 2025,
                            phone: '1234567890',
                            marks_10th: 90,
                            marks_12th: 95,
                            backlogs_active: 0
                        };
                        yield {
                            _id: new mongoose.Types.ObjectId(),
                            name: 'Test Student 2',
                            email: 'test2@student.com',
                            branch: 'ECE',
                            cgpa: 8.5,
                            status: 'PENDING',
                            graduation_year: 2024,
                            phone: '0987654321',
                            marks_10th: 85,
                            marks_12th: 85,
                            backlogs_active: 1
                        };
                    })()
                )
            })
        });

        Application.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockReturnValue({
                cursor: jest.fn().mockReturnValue(
                    (async function* () {
                        yield {
                            _id: new mongoose.Types.ObjectId(),
                            status: 'APPLIED',
                            created_at: new Date(),
                            student_id: { name: 'Test Student', email: 'test@student.com' },
                            job_id: { title: 'SDE 1', company_name: 'Tech Corp' }
                        };
                    })()
                )
            })
        });

        // Require the file so Worker gets instantiated
        const { dataExportQueue } = require('../src/utils/dataExportQueue');

        // Extract the callback BullMQ uses to process jobs
        const WorkerMock = Worker;
        expect(WorkerMock).toHaveBeenCalled();
        workerCallback = WorkerMock.mock.calls[0][1];
    });

    beforeEach(() => {
        jest.clearAllMocks();
        uploadToCloudinary.mockResolvedValue({ secure_url: 'https://cloudinary.com/fake.xlsx' });
    });

    it('should generate a valid Student Excel file with calculated CGPA and upload it', async () => {
        const job = {
            id: 'job-123',
            data: { adminEmail: 'admin@test.com', exportType: 'students' }
        };

        await workerCallback(job);

        // 1. Verify Cloudinary Upload Args
        expect(uploadToCloudinary).toHaveBeenCalled();
        const [bufferArg, folderArg, typeArg, publicIdArg] = uploadToCloudinary.mock.calls[0];

        expect(Buffer.isBuffer(bufferArg)).toBe(true);
        expect(folderArg).toBe('exports');
        expect(typeArg).toBe('raw');
        expect(publicIdArg).toMatch(/^PMS_STUDENTS_Export_\d+\.xlsx$/);

        // 2. Verify Email Dispatch
        expect(emailQueue.add).toHaveBeenCalledWith('export-ready-email', expect.objectContaining({
            email: 'admin@test.com',
            subject: 'Your STUDENTS Report is Ready'
        }));

        // 3. Verify Excel Buffer Integrity
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(bufferArg);

        const worksheet = workbook.getWorksheet('STUDENTS');
        expect(worksheet).toBeDefined();

        // Headers (Row 1)
        expect(worksheet.getRow(1).getCell(1).value).toBe('Name');
        expect(worksheet.getRow(1).getCell(4).value).toBe('CGPA');

        // Data Rows (Rows 2 & 3)
        expect(worksheet.getRow(2).getCell(1).value).toBe('Test Student');
        expect(worksheet.getRow(2).getCell(4).value).toBe(9.5);
        expect(worksheet.getRow(3).getCell(1).value).toBe('Test Student 2');
        expect(worksheet.getRow(3).getCell(4).value).toBe(8.5);

        // Summary Row (Row 4)
        expect(worksheet.getRow(4).getCell(1).value).toBe('AVERAGE CGPA ->');
        expect(parseFloat(worksheet.getRow(4).getCell(4).value)).toBe(9.00); // (9.5 + 8.5) / 2
    });

    it('should generate a valid Applications Excel file', async () => {
        const job = {
            id: 'job-123',
            data: {
                adminEmail: 'admin@test.com',
                exportType: 'applications'
            },
            progress: jest.fn()
        };

        await workerCallback(job);

        expect(uploadToCloudinary).toHaveBeenCalled();
        const [bufferArg, , , publicIdArg] = uploadToCloudinary.mock.calls[0];
        expect(publicIdArg).toMatch(/^PMS_APPLICATIONS_Export_\d+\.xlsx$/);

        const workbook = new exceljs.Workbook();
        await workbook.xlsx.load(bufferArg);
        const worksheet = workbook.getWorksheet('APPLICATIONS');

        expect(worksheet.getRow(1).getCell(2).value).toBe('Student Name');
        expect(worksheet.getRow(2).getCell(2).value).toBe('Test Student');
        expect(worksheet.getRow(2).getCell(4).value).toBe('SDE 1');
    });

    it('should throw an error for unsupported export types', async () => {
        const job = {
            id: 'job-789',
            data: { adminEmail: 'admin@test.com', exportType: 'invalid_type' }
        };

        await expect(workerCallback(job)).rejects.toThrow('Unknown export type');
    });
});
