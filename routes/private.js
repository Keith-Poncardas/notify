const express = require('express');
const router = express.Router();

const {
    createNewPost,
    alterPost,
    killPost,
    createNewComment,
    killComment,
    alterComment,
    editProfilePage,
    editProfile,
    getSearchResults,
    likeAndUnlikeToggle
} = require('../controller/private');

const upload = require('../config/multer');
const validateObjectId = require('../middleware/validateObjectId');
const validateSchema = require('../middleware/validateSchema');
const { editProfileSchema } = require('../utils/schemas');
const { deleteProfile } = require('../controller/auth');

router.post('/create', upload.single('postImage'), createNewPost);
router.put('/:id/edit-post', validateObjectId('id'), upload.single('postImage'), alterPost);
router.delete('/:id/delete-post', validateObjectId('id'), killPost);
router.post('/:id/create-comment', validateObjectId('id'), createNewComment);
router.delete('/:id/delete-comment', validateObjectId('id'), killComment);
router.put('/:id/edit-comment', validateObjectId('id'), alterComment);
router.get('/edit-profile', editProfilePage);
router.put('/edit-user', upload.single('profileImage'), validateSchema(editProfileSchema), editProfile);
router.get('/search-result', getSearchResults);
router.post('/like', likeAndUnlikeToggle);
router.delete('/:id/delete-profile', deleteProfile);

module.exports = router;