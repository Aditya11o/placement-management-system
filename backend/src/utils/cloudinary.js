const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const logger = require('./logger');

// These credentials should realistically come from .env
// We'll configure it to use env vars when instantiated
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadToCloudinary = (fileBuffer, folder, resourceType = 'auto', publicId = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: `placement_system/${folder}`,
            resource_type: resourceType
        };

        if (publicId) {
            options.public_id = publicId;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    logger.error(`Cloudinary Upload Error: ${error.message}`);
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};
