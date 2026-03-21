const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from typical filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'role'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|regex|options)\b/g, match => `$${match}`);

    // ── RBAC Branch Filtering for DEPARTMENT_HEAD ──────────────────────────────────
    if (req.user && req.user.role === 'ADMIN' && req.user.sub_role === 'DEPARTMENT_HEAD' && req.user.branch) {
        // If we're querying Students or Applications, restrict to their branch
        if (model.modelName === 'Student') {
            req.advancedFilter = { ...req.advancedFilter, branch: req.user.branch };
        } else if (model.modelName === 'Application') {
            req.advancedFilter = { ...req.advancedFilter, branch: req.user.branch };
        }
    }

    // Finding resource
    query = model.find({ ...JSON.parse(queryStr), ...(req.advancedFilter || {}) });

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-created_at'); // default sort
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments({ ...JSON.parse(queryStr), ...(req.advancedFilter || {}) });

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination = {
        total,
        pages: Math.ceil(total / limit)
    };

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        total,
        pagination,
        data: results
    };

    next();
};

module.exports = advancedResults;
