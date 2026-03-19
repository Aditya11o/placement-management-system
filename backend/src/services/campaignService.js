const Campaign = require('../models/Campaign');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Application = require('../models/Application');
const { emailQueue } = require('../utils/emailQueue');
const logger = require('../utils/logger');
const config = require('../config/config');

/**
 * Builds the MongoDB query for a campaign's target audience.
 * @param {string} target_audience 
 * @param {Object} target_filters 
 * @returns {Promise<Object>} { query, targetModel }
 */
const buildTargetQuery = async (target_audience, target_filters = {}) => {
    let query = {};
    let targetModel = Student;

    if (target_audience === 'ALL_STUDENTS') {
        query = {};
    } else if (target_audience === 'APPROVED_STUDENTS') {
        query = { status: 'APPROVED' };
    } else if (target_audience === 'UNPLACED_STUDENTS') {
        const placedIds = await Application.distinct('student_id', { status: 'SELECTED' });
        query = { status: 'APPROVED', _id: { $nin: placedIds } };
    } else if (target_audience === 'ALL_RECRUITERS') {
        targetModel = Recruiter;
        query = {};
    } else if (target_audience === 'CUSTOM') {
        if (target_filters.branch) query.branch = target_filters.branch;
        if (target_filters.graduation_year) query.graduation_year = target_filters.graduation_year;
        if (target_filters.cgpa_min) query.cgpa = { $gte: Number(target_filters.cgpa_min) };
        if (target_filters.backlogs_max !== undefined) query.backlogs_active = { $lte: Number(target_filters.backlogs_max) };
        if (target_filters.skills && target_filters.skills.length > 0) {
            query.skills = { $all: target_filters.skills.map(s => new RegExp(`^${s}$`, 'i')) };
        }
        if (target_filters.inactive_days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - Number(target_filters.inactive_days));
            const activeIds = await Application.distinct('student_id', { 
                created_at: { $gte: cutoff } 
            });
            query._id = { ...query._id || {}, $nin: activeIds };
        }
        query.status = 'APPROVED';
    }

    return { query, targetModel };
};

/**
 * Dispatches a campaign to its recipients.
 * @param {Object} campaign - The campaign document
 */
exports.dispatchCampaign = async (campaign) => {
    try {
        const { query, targetModel } = await buildTargetQuery(campaign.target_audience, campaign.target_filters);
        const recipients = await targetModel.find(query).select('email name company_name phone');

        if (recipients.length === 0) {
            campaign.status = 'COMPLETED';
            campaign.sent_count = 0;
            campaign.total_recipients = 0;
            await campaign.save();
            logger.warn(`Campaign ${campaign._id} finished with 0 recipients.`);
            return;
        }

        campaign.status = 'SENDING';
        campaign.total_recipients = recipients.length;
        await campaign.save();

        let successCount = 0;
        const chosenChannels = campaign.channels || ['EMAIL'];

        for (const person of recipients) {
            try {
                const name = person.name || person.company_name;

                if (chosenChannels.includes('EMAIL')) {
                    await emailQueue.add('campaign-email', {
                        email: person.email,
                        subject: campaign.subject,
                        template: 'alert',
                        context: {
                            title: campaign.title,
                            name: name,
                            message: campaign.html_content,
                            cta: { text: 'View Updates', url: `${config.get('frontend_url')}/dashboard` }
                        }
                    });
                }

                if (chosenChannels.includes('PUSH') || chosenChannels.includes('SMS')) {
                    logger.info(`[CAMPAIGN] Simulated ${chosenChannels.filter(c => c !== 'EMAIL').join('/')} to ${person.email}`);
                }

                successCount++;
            } catch (err) {
                logger.error(`Campaign ${campaign._id} dispatch error for ${person.email}: ${err.message}`);
            }
        }

        campaign.status = 'COMPLETED';
        campaign.sent_count = successCount;
        await campaign.save();

        logger.info(`Campaign ${campaign._id} finished: ${successCount}/${recipients.length} sent.`);
    } catch (err) {
        logger.error(`Campaign ${campaign._id} fatal dispatch error: ${err.message}`);
        campaign.status = 'FAILED';
        await campaign.save();
    }
};

exports.buildTargetQuery = buildTargetQuery;
