const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const authMiddleware = require('../middleware/authMiddleware');

// Public listing
router.get('/list', schemeController.getAllSchemes);

router.use(authMiddleware);

router.post('/create', schemeController.createScheme); // Ideally Admin only
router.post('/apply', schemeController.applyForScheme);
router.get('/my-applications', schemeController.getMyApplications);

module.exports = router;
