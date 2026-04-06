const prisma = require('../utils/prisma');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { category } = req.query;
    const resources = await prisma.resource.findMany({
      where: category ? { category } : {},
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private (Admin)
const createResource = async (req, res, next) => {
  const { title, description, category, type, content, instructor, duration, thumbnail, tags, url } = req.body;
  try {
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        category,
        type,
        content,
        instructor,
        duration,
        thumbnail,
        tags: Array.isArray(tags) ? tags : [],
        url: url || '',
        addedById: req.user.id,
      },
    });
    res.status(201).json({ ...resource, _id: resource.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res, next) => {
  try {
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.json({ message: 'Resource removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, createResource, deleteResource };
