const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const authMiddleware = require('../middleware/authMiddleware');

// Search can be public or protected. Assuming protected for tracking history.
router.use(authMiddleware);

router.get('/products/search', marketplaceController.searchProducts);
router.post('/products/:id/view', marketplaceController.logProductView);

router.post('/searches', marketplaceController.saveSearch);
router.get('/searches', marketplaceController.getSavedSearches);
router.get('/history', marketplaceController.getSearchHistory);

module.exports = router;
