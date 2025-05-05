const express = require('express');
const router = express.Router();
const handleFileUpload = require('../middlewares/upload');
const controller = require('../controllers/profileController');

router.get('/profile', controller.renderProfilePage);
router.put('/profile/:id', handleFileUpload, controller.updateProfile);

router.get('/admin', controller.renderAdminPage);
router.post('/verifyAdminLogin', handleFileUpload, controller.verifyAdminLogin);

module.exports = router;
