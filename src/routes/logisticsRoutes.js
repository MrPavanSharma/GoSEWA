const express = require('express');
const router = express.Router();
const logisticsController = require('../controllers/logisticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/rates', logisticsController.getShippingRates);
router.post('/book', logisticsController.bookShipment);
router.get('/:order_id', logisticsController.getShipmentDetails);

module.exports = router;
