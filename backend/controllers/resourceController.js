const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const resources = await Resource.find(query).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private (Admin)
const createResource = async (req, res, next) => {
  const { title, description, category, type, content, instructor, duration, thumbnail, tags } = req.body;
  try {
    const resource = await Resource.create({
      title,
      description,
      category,
      type,
      content,
      instructor,
      duration,
      thumbnail,
      tags,
      addedBy: req.user.id,
    });
    res.status(201).json(resource);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getResources, createResource, deleteResource };
