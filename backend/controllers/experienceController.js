const prisma = require('../utils/prisma');

// @desc    Create new experience post
// @route   POST /api/experiences
// @access  Private
const createExperience = async (req, res, next) => {
  try {
    const { title, content, companyName, role, batch, experienceType, difficulty, questions, tips, isAnonymous } = req.body;
    const userId = req.user.id;

    const experience = await prisma.experience.create({
      data: {
        title,
        content,
        companyName,
        role,
        batch,
        experienceType,
        difficulty,
        questions,
        tips,
        isAnonymous,
        studentId: userId
      },
      include: {
        student: {
          select: {
            name: true,
            profilePhoto: true
          }
        }
      }
    });

    res.status(201).json(experience);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all experiences with filters
// @route   GET /api/experiences
// @access  Private
const getExperiences = async (req, res, next) => {
  try {
    const { search, company, type, difficulty, sort = 'desc' } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (company) where.companyName = company;
    if (type) where.experienceType = type;
    if (difficulty) where.difficulty = difficulty;

    const experiences = await prisma.experience.findMany({
      where,
      include: {
        student: {
          select: {
            name: true,
            profilePhoto: true
          }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: sort }
    });

    res.json(experiences);
  } catch (err) {
    next(err);
  }
};

// @desc    Get experience by ID
// @route   GET /api/experiences/:id
// @access  Private
const getExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            name: true,
            profilePhoto: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                profilePhoto: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!experience) {
      return res.status(404).json({ message: 'Experience post not found' });
    }

    res.json(experience);
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle upvote
// @route   PATCH /api/experiences/:id/upvote
// @access  Private
const toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) return res.status(404).json({ message: 'Post not found' });

    let upvotes = [...experience.upvotes];
    if (upvotes.includes(userId)) {
      upvotes = upvotes.filter(uid => uid !== userId);
    } else {
      upvotes.push(userId);
    }

    const updated = await prisma.experience.update({
      where: { id },
      data: { upvotes }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment
// @route   POST /api/experiences/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await prisma.comment.create({
      data: {
        content,
        experienceId: id,
        userId
      },
      include: {
        user: {
          select: {
            name: true,
            profilePhoto: true
          }
        }
      }
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete experience
// @route   DELETE /api/experiences/:id
// @access  Private (Owner/Admin)
const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) return res.status(404).json({ message: 'Post not found' });

    if (experience.studentId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.experience.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createExperience,
  getExperiences,
  getExperienceById,
  toggleUpvote,
  addComment,
  deleteExperience
};
