const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Cart
router.post('/cart/items', orderController.addToCart);
router.get('/cart', orderController.getCart);

// Orders
router.post('/checkout', orderController.checkout);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderDetails);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
