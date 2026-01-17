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
    const { 
      full_name, business_name, business_type, gst_number, pan_number, description,
      // Gaushala Fields
      gaushala_name, registration_number, establishment_year, ownership_type,
      // New Address Fields
      premises_name, street_address, state, city, pincode
    } = req.body;

    console.log('DEBUG: Updating Profile for User:', req.user.id);
    console.log('DEBUG: Payload:', { premises_name, street_address, state, city, pincode });

    // Update User (Base) fields
    const [updatedCount] = await User.update({
      gaushala_name, registration_number, establishment_year, ownership_type,
      premises_name, street_address, state, city, pincode
    }, { where: { id: req.user.id } });

    console.log('DEBUG: User.update result:', updatedCount);
    
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

// Upload Profile Photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Create full URL (assuming server runs on port 3000)
    // In production, use env variable for base URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;

    let profile = await UserProfile.findOne({ where: { user_id: req.user.id } });

    if (profile) {
      await profile.update({ profile_image_url: profileImageUrl });
    } else {
      // Create profile if it doesn't exist (minimal)
      profile = await UserProfile.create({
        user_id: req.user.id,
        full_name: req.user.full_name || 'User', // Fallback
        profile_image_url: profileImageUrl,
        verification_status: 'PENDING'
      });
    }

    res.json({ 
      success: true, 
      message: 'Profile photo uploaded successfully', 
      data: { profile_image_url: profileImageUrl } 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  try {
    const { address_type, street_address, city, state, postal_code, is_default, latitude, longitude } = req.body;

    if (is_default) {
      // Unset previous default
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }

    const address = await Address.create({
      user_id: req.user.id,
      address_type, street_address, city, state, postal_code, is_default, latitude, longitude
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

    await address.update(req.body); // req.body includes lat/long if sent
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
