const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        if (decoded.role === 'STUDENT') user = await Student.findById(decoded.id);
        else if (decoded.role === 'RECRUITER') user = await Recruiter.findById(decoded.id);
        else if (decoded.role === 'ADMIN') user = await Admin.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Attach user object to request
        req.user = user;
        req.user.role = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not permitted to access this route`
            });
        }
        next();
    };
};
