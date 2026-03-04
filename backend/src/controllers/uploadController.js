const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { extractSkillsFromResume } = require('../utils/resumeAnalyzer');
const Log = require('../models/Log');

// Maximum number of resume versions stored per student
const MAX_RESUME_VERSIONS = 10;

/**
 * @desc    Upload a new resume version (student)
 * @route   POST /api/v1/upload/resume
 * @access  Private/Student
 *
 * Each upload:
 *   1. Uploads the PDF to Cloudinary
 *   2. Runs AI skill extraction in parallel
 *   3. Pushes a new version entry into `resume_versions[]`
 *   4. Marks the new version as `is_active: true`, deactivating all others
 *   5. Prunes oldest version if the cap (10) is exceeded
 */
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // Run Cloudinary Upload and AI Parsing in parallel
        const [uploadResult, extractedSkills] = await Promise.all([
            uploadToCloudinary(req.file.buffer, 'resumes'),
            extractSkillsFromResume(req.file.buffer)
        ]);

        // Deactivate all existing versions
        student.resume_versions.forEach(v => { v.is_active = false; });

        // Calculate next version number
        const nextVersion = student.resume_versions.length > 0
            ? Math.max(...student.resume_versions.map(v => v.version)) + 1
            : 1;

        // Push new version entry
        student.resume_versions.push({
            version: nextVersion,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            skills: extractedSkills,
            label: req.body.label || `v${nextVersion}`,
            is_active: true,
            uploaded_at: new Date()
        });

        // Enforce the version cap — prune oldest if exceeded
        if (student.resume_versions.length > MAX_RESUME_VERSIONS) {
            student.resume_versions.shift(); // remove the oldest entry
        }

        // Sync the top-level `skills` field with the new version's extracted skills
        student.skills = extractedSkills;

        await student.save();

        await Log.create({
            user_id: student._id,
            user_role: 'STUDENT',
            action: 'UPLOAD_RESUME',
            description: `Uploaded resume version v${nextVersion}`
        });

        const newVersion = student.resume_versions[student.resume_versions.length - 1];

        res.status(201).json({
            success: true,
            message: `Resume v${nextVersion} uploaded and set as active`,
            data: {
                version: newVersion.version,
                label: newVersion.label,
                url: newVersion.url,
                skills: newVersion.skills,
                uploaded_at: newVersion.uploaded_at,
                totalVersions: student.resume_versions.length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get full resume version history for the authenticated student
 * @route   GET /api/v1/upload/resume/history
 * @access  Private/Student
 */
exports.getResumeHistory = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id).select('resume_versions');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const versions = [...student.resume_versions]
            .sort((a, b) => b.version - a.version); // newest first

        res.status(200).json({
            success: true,
            count: versions.length,
            data: versions
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Activate a specific resume version (student switches their active resume)
 * @route   PUT /api/v1/upload/resume/history/:versionId/activate
 * @access  Private/Student
 */
exports.activateResumeVersion = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const target = student.resume_versions.id(req.params.versionId);
        if (!target) {
            return res.status(404).json({ success: false, message: 'Resume version not found' });
        }

        // Deactivate all, then activate the target
        student.resume_versions.forEach(v => { v.is_active = false; });
        target.is_active = true;

        // Sync top-level skills field with the activated version
        student.skills = target.skills;

        await student.save();

        await Log.create({
            user_id: student._id,
            user_role: 'STUDENT',
            action: 'ACTIVATE_RESUME_VERSION',
            description: `Activated resume version v${target.version} (${target.label})`
        });

        res.status(200).json({
            success: true,
            message: `Resume v${target.version} (${target.label}) is now the active version`,
            data: target
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Delete a specific resume version from history (cannot delete the active version)
 * @route   DELETE /api/v1/upload/resume/history/:versionId
 * @access  Private/Student
 */
exports.deleteResumeVersion = async (req, res) => {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const target = student.resume_versions.id(req.params.versionId);
        if (!target) {
            return res.status(404).json({ success: false, message: 'Resume version not found' });
        }

        if (target.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the currently active resume version. Activate another version first.'
            });
        }

        const deletedVersion = target.version;
        target.deleteOne(); // Mongoose sub-document removal
        await student.save();

        await Log.create({
            user_id: student._id,
            user_role: 'STUDENT',
            action: 'DELETE_RESUME_VERSION',
            description: `Deleted resume version v${deletedVersion}`
        });

        res.status(200).json({
            success: true,
            message: `Resume v${deletedVersion} removed from history`,
            data: { remainingVersions: student.resume_versions.length }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Upload recruiter company logo
 * @route   POST /api/v1/upload/logo
 * @access  Private/Recruiter
 */
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const recruiter = await Recruiter.findById(req.user._id);
        if (!recruiter) return res.status(404).json({ success: false, message: 'Recruiter not found' });

        const result = await uploadToCloudinary(req.file.buffer, 'logos');

        recruiter.logo_url = result.secure_url;
        await recruiter.save();

        await Log.create({
            user_id: recruiter._id,
            user_role: 'RECRUITER',
            action: 'UPLOAD_LOGO',
            description: 'Recruiter uploaded a new company logo'
        });

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: recruiter.logo_url
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Upload student profile photo
 * @route   POST /api/v1/upload/profile-photo
 * @access  Private/Student
 */
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const student = await Student.findById(req.user._id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const result = await uploadToCloudinary(req.file.buffer, 'avatars');

        student.profile_image_url = result.secure_url;
        await student.save();

        await Log.create({
            user_id: student._id,
            user_role: 'STUDENT',
            action: 'UPLOAD_PROFILE_PHOTO',
            description: 'Student uploaded a new profile photo'
        });

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: student.profile_image_url
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
