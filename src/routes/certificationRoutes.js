const express = require('express');
const router = express.Router();
const certificationController = require('../controllers/certificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/upload', certificationController.uploadCertificate);
router.get('/:gaushala_id/list', certificationController.getCertificates);
router.put('/:id/verify', certificationController.verifyCertificate);

module.exports = router;
