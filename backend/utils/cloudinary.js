const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Centered Helper to upload to Cloudinary with optimization
 * @param {Buffer|String} resource - Buffer (from multer) or Base64 string
 * @param {Object} options - Cloudinary upload options
 * @param {String} preset - 'avatar' | 'logo' | 'standard'
 */
const uploadToCloudinary = async (resource, options = {}, preset = 'standard') => {
  const presets = {
    avatar: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      fetch_format: 'webp',
      quality: 'auto'
    },
    logo: {
      height: 200,
      crop: 'limit',
      fetch_format: 'webp',
      quality: 'auto'
    },
    standard: {
      fetch_format: 'webp',
      quality: 'auto'
    }
  };

  const uploadOptions = {
    ...presets[preset],
    ...options
  };

  if (Buffer.isBuffer(resource)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      const readableStream = new Readable();
      readableStream.push(resource);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  // Handle Base64 or URL
  return cloudinary.uploader.upload(resource, uploadOptions);
};

module.exports = { cloudinary, uploadToCloudinary };
