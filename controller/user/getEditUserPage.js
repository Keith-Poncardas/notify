/**
 * Renders the edit profile page for authenticated users.
 * @param {import('express').Request} req - The Express request object
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').NextFunction} next - The Express next middleware function
 * @returns {Promise<void>} A promise that resolves when the page is rendered
 * @throws {Error} Forwards any errors to the next middleware
 */
module.exports = async (req, res, next) => {
    try {
        res.render('private/edit-profile');
    } catch (err) {
        next(err);
    }
};