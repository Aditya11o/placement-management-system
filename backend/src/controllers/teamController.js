const Recruiter = require('../models/Recruiter');
const Company = require('../models/Company');
const Log = require('../models/Log');

// @desc    Get company details and join code
// @route   GET /api/v1/team/company
// @access  Private (Recruiter)
exports.getCompanyDetails = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter.company_id) {
            return res.status(404).json({ success: false, message: 'No company found for this recruiter' });
        }

        const company = await Company.findById(recruiter.company_id);
        res.status(200).json({ success: true, data: company });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all team members
// @route   GET /api/v1/team/members
// @access  Private (Recruiter)
exports.getTeamMembers = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter.company_id) {
            return res.status(404).json({ success: false, message: 'No company found' });
        }

        const members = await Recruiter.find({ company_id: recruiter.company_id })
            .select('contact_person email phone team_role created_at status');

        res.status(200).json({ success: true, data: members });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update member role (OWNER only)
// @route   PUT /api/v1/team/members/:id/role
// @access  Private (Recruiter OWNER)
exports.updateMemberRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['OWNER', 'MEMBER'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const self = await Recruiter.findById(req.user._id);
        if (self.team_role !== 'OWNER') {
            return res.status(403).json({ success: false, message: 'Only company owners can update roles' });
        }

        const member = await Recruiter.findById(req.params.id);
        if (!member || member.company_id.toString() !== self.company_id.toString()) {
            return res.status(404).json({ success: false, message: 'Member not found in your team' });
        }

        member.team_role = role;
        await member.save();

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'UPDATE_TEAM_ROLE',
            target_id: member._id,
            description: `Updated ${member.contact_person} to ${role}`
        });

        res.status(200).json({ success: true, message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
