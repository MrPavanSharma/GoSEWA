const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Gaushala View
router.get('/gaushala', analyticsController.getGaushalaStats);

// Entrepreneur View
router.get('/entrepreneur', analyticsController.getEntrepreneurStats);

module.exports = router;
