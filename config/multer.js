const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

/**
 * Multer middleware configuration for image uploads
 * @type {multer.Multer}
 * @description Configures multer for handling file uploads with the following settings:
 * - Storage: Uses predefined storage configuration
 * - File Filter: Accepts only .png and .jpeg image files
 * - Size Limit: Maximum file size of 5MB (5 * 1024 * 1024 bytes)
 * @throws {Error} When file type is not .png or .jpeg
 * @throws {Error} When file size exceeds 5MB
 */
const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
            return cb(new Error('Only .png, .jpg, .gif and .jpeg images are allowed'));
        }
        cb(null, true);
    },

    limits: {
        fileSize: 5 * 1024 * 1024
    },
});

module.exports = upload;