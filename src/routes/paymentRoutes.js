const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/process', paymentController.processPayment);
router.get('/:order_id', paymentController.getPaymentDetails);

router.get('/:order_id/invoice', paymentController.getInvoice);

router.post('/refund', paymentController.initiateRefund);

module.exports = router;
