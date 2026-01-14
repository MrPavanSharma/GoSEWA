const { User, UserProfile, Address, BusinessDocument } = require('../models');

// Get full profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { model: UserProfile },
        { model: Address },
        { model: BusinessDocument }
      ]
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update profile details
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, business_name, business_type, gst_number, pan_number, description } = req.body;
    
    let profile = await UserProfile.findOne({ where: { user_id: req.user.id } });

    if (profile) {
      await profile.update({
        full_name, business_name, business_type, gst_number, pan_number, description
      });
    } else {
      profile = await UserProfile.create({
        user_id: req.user.id,
        full_name, business_name, business_type, gst_number, pan_number, description
      });
    }

    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  try {
    const { address_type, street_address, city, state, postal_code, is_default } = req.body;

    if (is_default) {
      // Unset previous default
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    const address = await Address.create({
      user_id: req.user.id,
      address_type, street_address, city, state, postal_code, is_default
    });

    res.status(201).json({ success: true, message: 'Address added', data: address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ where: { id, user_id: req.user.id } });

    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (req.body.is_default) {
       await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    await address.update(req.body);
    res.json({ success: true, message: 'Address updated', data: address });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.destroy({ where: { id, user_id: req.user.id } });

    if (!deleted) return res.status(404).json({ success: false, message: 'Address not found' });

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upload Document (Simulated)
exports.uploadDocument = async (req, res) => {
  try {
    // In a real app, this would handle file uploads to S3/Local
    // Here we accept a 'document_url' string or simulate one
    const { document_type, document_url } = req.body;

    const doc = await BusinessDocument.create({
      user_id: req.user.id,
      document_type,
      document_url: document_url || 'http://mock-storage/doc.pdf',
      verification_status: 'PENDING'
    });

    res.status(201).json({ success: true, message: 'Document uploaded', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await BusinessDocument.findAll({ where: { user_id: req.user.id } });
    res.json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
