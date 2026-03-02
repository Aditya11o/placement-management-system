const convict = require('convict');
const validator = require('validator');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables into process.env before convict reads them
dotenv.config();

// Define custom format for MongoDB URI
convict.addFormat({
    name: 'mongo-uri',
    validate: (val) => {
        if (!val.startsWith('mongodb://') && !val.startsWith('mongodb+srv://')) {
            throw new Error('must be a valid MongoDB connection string');
        }
    }
});

// Define custom format for comma-separated list
convict.addFormat({
    name: 'comma-separated-list',
    validate: (val) => {
        if (typeof val !== 'string' && !Array.isArray(val)) {
            throw new Error('must be a comma-separated string or an array');
        }
    },
    coerce: (val) => {
        if (typeof val === 'string') {
            return val.split(',').map(s => s.trim());
        }
        return val;
    }
});

// Define custom format for email
convict.addFormat({
    name: 'email',
    validate: (val) => {
        if (!validator.isEmail(val)) {
            throw new Error('must be a valid email address');
        }
    }
});

const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    },
    port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 5000,
        env: 'PORT'
    },
    https: {
        doc: 'Enable HTTPS.',
        format: Boolean,
        default: false,
        env: 'HTTPS'
    },
    mongo: {
        uri: {
            doc: 'MongoDB connection string.',
            format: 'mongo-uri',
            default: 'mongodb://localhost:27017/placement_management',
            env: 'MONGO_URI',
            sensitive: true
        }
    },
    jwt: {
        secret: {
            doc: 'JWT secret key.',
            format: String,
            default: '',
            env: 'JWT_SECRET',
            sensitive: true
        },
        expire: {
            doc: 'JWT expiration time.',
            format: String,
            default: '7d',
            env: 'JWT_EXPIRE'
        }
    },
    salt_rounds: {
        doc: 'Bcrypt salt rounds.',
        format: Number,
        default: 10,
        env: 'SALT_ROUNDS'
    },
    cloudinary: {
        cloud_name: {
            doc: 'Cloudinary cloud name.',
            format: String,
            default: '',
            env: 'CLOUDINARY_CLOUD_NAME'
        },
        api_key: {
            doc: 'Cloudinary API key.',
            format: String,
            default: '',
            env: 'CLOUDINARY_API_KEY'
        },
        api_secret: {
            doc: 'Cloudinary API secret.',
            format: String,
            default: '',
            env: 'CLOUDINARY_API_SECRET',
            sensitive: true
        }
    },
    smtp: {
        host: {
            doc: 'SMTP host.',
            format: String,
            default: 'localhost',
            env: 'SMTP_HOST'
        },
        port: {
            doc: 'SMTP port.',
            format: 'port',
            default: 25,
            env: 'SMTP_PORT'
        },
        email: {
            doc: 'SMTP email.',
            format: String,
            default: '',
            env: 'SMTP_EMAIL'
        },
        password: {
            doc: 'SMTP password.',
            format: String,
            default: '',
            env: 'SMTP_PASSWORD',
            sensitive: true
        }
    },
    from: {
        email: {
            doc: 'Sender email address.',
            format: 'email',
            default: 'noreply@pms.com',
            env: 'FROM_EMAIL'
        },
        name: {
            doc: 'Sender name.',
            format: String,
            default: 'PMS Admin',
            env: 'FROM_NAME'
        }
    },
    cors: {
        whitelist: {
            doc: 'Allowed CORS origins.',
            format: 'comma-separated-list',
            default: ['http://localhost:3000'],
            env: 'CORS_WHITELIST'
        }
    },
    redis: {
        url: {
            doc: 'Redis connection URL.',
            format: String,
            default: 'redis://localhost:6379',
            env: 'REDIS_URL',
            sensitive: true
        }
    },
    gemini: {
        api_key: {
            doc: 'Google Gemini API key.',
            format: String,
            default: '',
            env: 'GEMINI_API_KEY',
            sensitive: true
        }
    },
    frontend_url: {
        doc: 'Frontend URL.',
        format: String,
        default: 'http://localhost:3000',
        env: 'FRONTEND_URL'
    }
});

// Perform validation
config.validate({ allowed: 'strict' });

module.exports = config;
