const express = require('express');
const router = express.Router();
const transporterController = require('../controllers/transporterController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/profile', transporterController.createOrUpdateProfile);
router.post('/vehicles', transporterController.addVehicle);
router.get('/vehicles', transporterController.getFleet);

module.exports = router;
