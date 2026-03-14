const mongoose = require('mongoose');
const { getCurrentTenantId } = require('../../middlewares/tenantMiddleware');

/**
 * Mongoose Plugin for Multi-Tenancy
 * 
 * Automatically adds a `college_id` field to the schema and 
 * intercepts all queries to scope them to the current tenant.
 */
module.exports = function tenantPlugin(schema, options) {
    // Add college_id field to the schema
    schema.add({
        college_id: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            // required: true // Can be enabled strictly later
        }
    });

    // Intercept Queries to automatically inject college_id
    const addTenantFilter = function (next) {
        const tenantId = getCurrentTenantId();
        
        if (tenantId) {
            // Apply tenant scoping
            this.where({ college_id: tenantId });
        }
        
        next();
    };

    // Apply to all standard query methods
    schema.pre('find', addTenantFilter);
    schema.pre('findOne', addTenantFilter);
    schema.pre('findOneAndUpdate', addTenantFilter);
    schema.pre('countDocuments', addTenantFilter);
    schema.pre('updateMany', addTenantFilter);

    // Auto-inject tenant on document creation
    schema.pre('save', function (next) {
        const tenantId = getCurrentTenantId();
        if (tenantId && !this.college_id) {
            this.college_id = tenantId;
        }
        next();
    });
};
