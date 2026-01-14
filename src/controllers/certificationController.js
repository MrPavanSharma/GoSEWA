const { Certification, User } = require('../models');

// Upload Certificate (Gaushala)
exports.uploadCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, issuing_authority, certificate_number, issue_date, expiry_date, document_url } = req.body;

    const cert = await Certification.create({
        gaushala_id: userId,
        name,
        issuing_authority,
        certificate_number,
        issue_date,
        expiry_date,
        document_url
    });

    res.status(201).json({ success: true, message: 'Certificate uploaded, pending verification', data: cert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Certificates
exports.getCertificates = async (req, res) => {
  try {
    const { gaushala_id } = req.params;
    
    // Only show verified certs to public unless it's the owner? 
    // Usually public should see verified ones.
    const certs = await Certification.findAll({
        where: { gaushala_id, is_verified: true }
    });

    res.json({ success: true, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Verify Endpoint (Simulated)
exports.verifyCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    // TODO: Check if user is ADMIN. For now, open.
    const cert = await Certification.findByPk(id);
    if (!cert) return res.status(404).json({ success: false, message: 'Not found' });

    await cert.update({ is_verified });
    res.json({ success: true, message: 'Certificate status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
