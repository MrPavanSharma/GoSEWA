const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/product/:product_id', reviewController.getProductReviews);
router.get('/gaushala/:gaushala_id', reviewController.getGaushalaReviews);

// Protected Routes
router.use(authMiddleware);
router.post('/', reviewController.addReview);

module.exports = router;
