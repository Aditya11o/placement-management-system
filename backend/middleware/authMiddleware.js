const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (req.user) {
        if (req.user.status === 'inactive') {
          res.status(403);
          return res.json({ message: 'Account is deactivated' });
        }
        if (req.user.status === 'pending' && req.user.role === 'recruiter') {
          res.status(403);
          return res.json({ message: 'Your recruiter account is pending administrator approval.' });
        }
        if (req.user.status === 'blacklisted') {
          res.status(403);
          return res.json({ message: 'Your account has been blacklisted' });
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      res.json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401);
    res.json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as an admin' });
  }
};

// Recruiter middleware
const recruiter = (req, res, next) => {
  if (req.user && req.user.role === 'recruiter') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as a recruiter' });
  }
};

// Student middleware
const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403);
    res.json({ message: 'Not authorized as a student' });
  }
};
// Role authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return res.json({ message: `Role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize, admin, recruiter, student };
