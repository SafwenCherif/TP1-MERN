const express = require('express');
const userController = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', protect, userController.getUserProfile);
router.put('/update-password', protect, userController.updatePassword);
router.put('/:id/role', protect, adminOnly, userController.updateUserRole);
router.get('/', protect, adminOnly, userController.getAllUsers);

module.exports = router;
