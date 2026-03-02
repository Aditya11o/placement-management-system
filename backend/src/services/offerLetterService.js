const PDFDocument = require('pdfkit');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { emailQueue } = require('../utils/emailQueue');
const logger = require('../utils/logger');

/**
 * Generates a professional offer letter PDF for a SELECTED student,
 * uploads it to Cloudinary, and queues a congratulations email containing
 * the Cloudinary PDF link.
 *
 * Designed to be called as a fire-and-forget side-effect from `updateApplicationStatus`
 * when the status transitions to 'SELECTED'. Errors are caught and logged but
 * never thrown — they must not crash the main HTTP response.
 *
 * @param {Object} options
 * @param {Object} options.student   - { name, email } — populated from Application
 * @param {Object} options.job       - { title, company_name, location, package_lpa } — populated Job doc
 * @param {string} options.applicationId - MongoDB Application _id (string)
 * @returns {Promise<string|null>}    - Cloudinary secure URL of the PDF, or null on failure
 */
exports.generateOfferLetter = async ({ student, job, applicationId }) => {
    try {
        // ── Step 1: Generate PDF in-memory using PDFKit ─────────────────────────
        const pdfBuffer = await buildOfferLetterPDF({ student, job });

        // ── Step 2: Upload PDF buffer to Cloudinary ─────────────────────────────
        const uploadResult = await uploadToCloudinary(pdfBuffer, 'offer-letters', 'raw', `offer_${applicationId}`);

        const pdfUrl = uploadResult.secure_url;
        logger.info(`[OfferLetter] Generated for app ${applicationId}: ${pdfUrl}`);

        // ── Step 3: Email the student a congratulations with the PDF link ────────
        try {
            await emailQueue.add('offer-letter-email', {
                email: student.email,
                subject: `🎉 Congratulations! Offer Letter from ${job.company_name}`,
                template: 'alert',
                context: {
                    title: `You've been Selected! 🎉`,
                    name: student.name,
                    message: `We are thrilled to inform you that ${job.company_name} has selected you for the position of **${job.title}**.\n\nYour offer letter has been generated and is available for download via the link below. Please review it carefully.`,
                    cta: {
                        text: 'Download Offer Letter (PDF)',
                        url: pdfUrl
                    }
                }
            });
        } catch (emailErr) {
            logger.error(`[OfferLetter] Email queue failed for app ${applicationId}: ${emailErr.message}`);
            // Don't throw — PDF was still generated and URL will be saved
        }

        return pdfUrl;
    } catch (err) {
        logger.error(`[OfferLetter] Generation failed for app ${applicationId}: ${err.message}`);
        return null;
    }
};

// ── PDF Layout Builder ────────────────────────────────────────────────────────
/**
 * Builds the full offer letter PDF as a Buffer using PDFKit.
 * Returns a Promise<Buffer> so callers can await it cleanly.
 */
function buildOfferLetterPDF({ student, job }) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 60, size: 'A4' });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const issuedDate = new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // ── Header bar (dark navy) ─────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
        doc
            .fillColor('#ffffff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text(job.company_name.toUpperCase(), 60, 28, { align: 'left' });
        doc
            .fillColor('#94a3b8')
            .fontSize(10)
            .font('Helvetica')
            .text('PLACEMENT MANAGEMENT SYSTEM  •  OFFER LETTER', 60, 62, { align: 'left' });

        doc.moveDown(3);

        // ── Document meta line ─────────────────────────────────────────────────
        doc
            .fillColor('#64748b')
            .font('Helvetica')
            .fontSize(9)
            .text(`Date: ${issuedDate}   |   Ref: OFFER-${Date.now()}`, { align: 'right' });

        doc.moveDown(1.5);

        // ── Salutation ─────────────────────────────────────────────────────────
        doc
            .fillColor('#1e293b')
            .font('Helvetica-Bold')
            .fontSize(13)
            .text(`Dear ${student.name},`);

        doc.moveDown(0.8);

        // ── Opening paragraph ─────────────────────────────────────────────────
        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#334155')
            .text(
                `We are delighted to extend this offer of employment to you for the position of ` +
                `${job.title} at ${job.company_name}. After careful consideration of your academic ` +
                `profile and performance, we are pleased to welcome you to our team.`,
                { lineGap: 4, paragraphGap: 8 }
            );

        doc.moveDown(1);

        // ── Offer Details box ─────────────────────────────────────────────────
        doc
            .fillColor('#f1f5f9')
            .roundedRect(60, doc.y, doc.page.width - 120, 140, 8)
            .fill();

        const boxTop = doc.y - 140;
        doc.y = boxTop + 18;

        doc
            .fillColor('#0f172a')
            .font('Helvetica-Bold')
            .fontSize(11)
            .text('OFFER DETAILS', 80, doc.y);

        doc.moveDown(0.7);
        drawDetailRow(doc, '📌 Position', job.title);
        drawDetailRow(doc, '🏢 Company', job.company_name);
        drawDetailRow(doc, '📍 Location', job.location || 'As per company policy');
        drawDetailRow(doc, '💰 CTC', job.package_lpa ? `₹ ${job.package_lpa} LPA` : 'As per company policy');
        drawDetailRow(doc, '📅 Joining', 'As communicated by the HR team');

        doc.y = boxTop + 158;
        doc.moveDown(1.5);

        // ── Terms paragraph ────────────────────────────────────────────────────
        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#334155')
            .text(
                `This offer is contingent upon the successful completion of your degree, verification ` +
                `of academic credentials, and satisfactory background checks. Kindly confirm your ` +
                `acceptance by responding to this letter within 7 days of receipt.`,
                { lineGap: 4 }
            );

        doc.moveDown(1.5);

        // ── Closing ────────────────────────────────────────────────────────────
        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#334155')
            .text(
                `We look forward to having you on board. Should you have any questions, please do ` +
                `not hesitate to reach out to the placement cell.`
            );

        doc.moveDown(2.5);

        doc.font('Helvetica-Bold').fillColor('#1e293b').text('Sincerely,');
        doc.moveDown(0.4);
        doc.font('Helvetica-Bold').fontSize(12).text(job.company_name);
        doc.font('Helvetica').fontSize(10).fillColor('#64748b').text('Human Resources Department');

        // ── Footer ────────────────────────────────────────────────────────────
        const footerY = doc.page.height - 45;
        doc
            .rect(0, footerY, doc.page.width, 45)
            .fill('#0f172a');
        doc
            .fillColor('#94a3b8')
            .fontSize(8)
            .font('Helvetica')
            .text(
                `This is a system-generated offer letter. For queries, contact the placement cell.`,
                60, footerY + 16,
                { align: 'center', width: doc.page.width - 120 }
            );

        doc.end();
    });
}

// ── Utility: draws a two-column label/value row ────────────────────────────
function drawDetailRow(doc, label, value) {
    const x = 80;
    const valueX = 230;
    const y = doc.y;

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569').text(label, x, y, { continued: false, width: 140 });
    doc.font('Helvetica').fontSize(10).fillColor('#1e293b').text(value, valueX, y, { width: 280 });
    doc.y = Math.max(doc.y, y + 18);
}
