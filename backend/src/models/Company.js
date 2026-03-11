const mongoose = require('mongoose');
const crypto = require('crypto');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a company name'],
        trim: true,
        unique: true
    },
    join_code: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    logo_url: {
        type: String
    },
    website: {
        type: String
    },
    description: {
        type: String
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Generate a unique join code before saving
companySchema.pre('save', async function (next) {
    if (!this.join_code) {
        // Generate a code like "GOOG-A1B2"
        const prefix = this.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
        const random = crypto.randomBytes(2).toString('hex').toUpperCase();
        this.join_code = `${prefix}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Company', companySchema);
