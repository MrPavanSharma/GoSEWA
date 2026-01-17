const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Livestock (Gauvansh Record)
router.post('/livestock', stockController.addLivestock);
router.get('/livestock', stockController.getLivestock);
router.put('/livestock/:id', stockController.updateLivestock);
router.delete('/livestock/:id', stockController.deleteLivestock);

// Health
router.post('/livestock/:id/health', stockController.addHealthRecord);
router.get('/livestock/:id/health', stockController.getHealthRecords);

// Milk
router.post('/livestock/:id/milk', stockController.logMilkProduction);

module.exports = router;
