const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public or semi-protected routes (e.g. browsing products might be public in future, but spec says Auth Required)
router.use(authMiddleware); 

// Categories
router.post('/categories', inventoryController.createCategory);
router.get('/categories', inventoryController.getCategories);

// Products
router.post('/products', inventoryController.createProduct);
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProductDetails);

// Inventory
router.post('/products/:id/inventory', inventoryController.updateInventory);
router.get('/products/:id/logs', inventoryController.getInventoryLogs);

module.exports = router;
