const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    updateUserProfile,
    deleteUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, upload.single('image'), updateUserProfile);
router.delete('/profile', protect, deleteUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

module.exports = router;
