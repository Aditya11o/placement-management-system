const { AsyncLocalStorage } = require('async_hooks');

const tenantStorage = new AsyncLocalStorage();

/**
 * Middleware to extract the tenant (college_id) from the request
 * and make it globally available throughout the request lifecycle
 * using AsyncLocalStorage.
 */
const tenantMiddleware = (req, res, next) => {
    // Determine tenant from user token, custom header, or subdomain
    let collegeId = null;

    if (req.user && req.user.college_id) {
        collegeId = req.user.college_id.toString();
    } else if (req.headers['x-college-id']) {
        collegeId = req.headers['x-college-id'];
    }

    if (!collegeId) {
        // For routes that don't need a tenant yet (like global admin auth)
        // we can still run the context with a null tenant
        return tenantStorage.run({ collegeId: null }, () => {
            next();
        });
    }

    // Run the rest of the request within this tenant context
    tenantStorage.run({ collegeId }, () => {
        next();
    });
};

/**
 * Utility to get the current tenant ID from anywhere in the app
 */
const getCurrentTenantId = () => {
    const store = tenantStorage.getStore();
    return store ? store.collegeId : null;
};

module.exports = {
    tenantMiddleware,
    getCurrentTenantId,
    tenantStorage
};
