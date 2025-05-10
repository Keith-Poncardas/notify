const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const uploadToCloudinary = (fileBuffer, folder = 'Uploads') => {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        const readable = new Readable();
        readable._read = () => { };
        readable.push(fileBuffer);
        readable.push(null);
        readable.pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;