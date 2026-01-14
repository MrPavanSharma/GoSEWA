const { Scheme, SchemeApplication, User } = require('../models');

// list all schemes (Public)
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.findAll({
        where: { is_active: true }
    });
    res.json({ success: true, data: schemes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Apply for Scheme (User)
exports.applyForScheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheme_id, application_notes } = req.body;

    // Check if already applied
    const existing = await SchemeApplication.findOne({
        where: { user_id: userId, scheme_id }
    });

    if (existing) {
        return res.status(400).json({ success: false, message: 'Already applied for this scheme' });
    }

    const application = await SchemeApplication.create({
        user_id: userId,
        scheme_id,
        application_notes,
        status: 'APPLIED'
    });

    res.status(201).json({ success: true, message: 'Application submitted', data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create Scheme (Admin - For seeding/demo)
exports.createScheme = async (req, res) => {
    try {
        const { title, ministry, description, funding_type, application_link } = req.body;
        const scheme = await Scheme.create({
            title, ministry, description, funding_type, application_link
        });
        res.status(201).json({ success: true, data: scheme });
    } catch(error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get My Applications
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const apps = await SchemeApplication.findAll({
            where: { user_id: userId },
            include: [{ model: Scheme }]
        });
        res.json({ success: true, data: apps });
    } catch(error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
