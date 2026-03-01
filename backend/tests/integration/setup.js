/**
 * Integration Test Setup File
 * Runs once per integration test file (via `setupFilesAfterFramework`).
 *
 * Mocks all external services that can't run in a CI/test environment:
 *   - BullMQ email queue
 *   - BullMQ webhook queue
 *   - Cloudinary (uploadToCloudinary)
 *   - Offer letter service (avoids real PDF+Cloudinary calls in status-update tests)
 *
 * The real app + Express routing still loads — only the I/O side-effects are stubbed.
 */

// ── Mock BullMQ Queues ────────────────────────────────────────────────────────
// Prevents connection attempts to Redis when emailQueue / webhookQueue are required
jest.mock('../src/utils/emailQueue', () => ({
    emailQueue: {
        add: jest.fn().mockResolvedValue({ id: 'mocked-email-job' }),
        on: jest.fn()
    }
}));

jest.mock('../src/utils/webhookQueue', () => ({
    webhookQueue: {
        add: jest.fn().mockResolvedValue({ id: 'mocked-webhook-job' }),
        on: jest.fn()
    }
}));

// ── Mock Cloudinary ────────────────────────────────────────────────────────────
jest.mock('../src/utils/cloudinary', () => ({
    uploadToCloudinary: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test-upload.pdf',
        public_id: 'test-upload'
    })
}));

// ── Mock AI Resume Analyser ────────────────────────────────────────────────────
jest.mock('../src/utils/resumeAnalyzer', () => ({
    extractSkillsFromResume: jest.fn().mockResolvedValue(['JavaScript', 'Node.js', 'React'])
}));

// ── Mock Offer Letter Service ──────────────────────────────────────────────────
// The applicationStatus tests verify the HTTP flow — not the PDF generation itself
jest.mock('../src/services/offerLetterService', () => ({
    generateOfferLetter: jest.fn().mockResolvedValue(
        'https://res.cloudinary.com/test/raw/upload/v1/offer_mock.pdf'
    )
}));
