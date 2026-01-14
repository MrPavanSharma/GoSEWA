const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all profile routes

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

router.post('/addresses', profileController.addAddress);
router.put('/addresses/:id', profileController.updateAddress);
router.delete('/addresses/:id', profileController.deleteAddress);

router.post('/documents', profileController.uploadDocument);
router.get('/documents', profileController.getDocuments);

module.exports = router;
