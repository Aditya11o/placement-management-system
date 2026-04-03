/**
 * Pagination helper — extracts page/limit from query params and returns
 * skip, limit, and a function to build the paginated response envelope.
 *
 * Usage in controllers:
 *   const { skip, limit, paginate } = parsePagination(req.query);
 *   const [items, total] = await Promise.all([
 *     Model.find(query).skip(skip).limit(limit),
 *     Model.countDocuments(query)
 *   ]);
 *   res.json(paginate(items, total));
 *
 * Clients call: GET /api/jobs?page=2&limit=20
 * Response shape:
 *   { data: [...], pagination: { page, limit, total, totalPages } }
 *
 * If no page/limit is provided, defaults to page=1, limit=20.
 * Set limit=0 to disable pagination and return all results.
 */
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = parseInt(query.limit) || 20;
  const skip = limit > 0 ? (page - 1) * limit : 0;

  const paginate = (data, total) => ({
    data,
    pagination: {
      page,
      limit: limit > 0 ? limit : total,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    },
  });

  return { page, skip, limit: limit > 0 ? limit : 0, paginate };
};

module.exports = { parsePagination };
