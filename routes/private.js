const express = require('express');
const router = express.Router();

const { createNewPost, alterPost, killPost, createNewComment, killComment, alterComment, editProfilePage, editProfile, getSearchResults, likeAndUnlikeToggle, likeStatus } = require('../controller/private');
const upload = require('../config/multer');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/create', upload.single('postImage'), createNewPost);
router.put('/:id/edit-post', validateObjectId('id'), upload.single('postImage'), alterPost);
router.delete('/:id/delete-post', validateObjectId('id'), killPost);

router.post('/:id/create-comment', validateObjectId('id'), createNewComment);
router.delete('/:id/delete-comment', validateObjectId('id'), killComment);
router.put('/:id/edit-comment', validateObjectId('id'), alterComment);

router.get('/edit-profile', editProfilePage);

router.put('/edit-user', editProfile);

router.get('/search-result', getSearchResults);

// For likes 
router.post('/like', likeAndUnlikeToggle);

module.exports = router;