const { TransporterProfile, Vehicle, User } = require('../models');

// Create/Update Transporter Profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company_name, license_number } = req.body;

    // Ensure user role is TRANSPORTER (or allow update if verified?)
    // In our simplified auth, we trust the token. In real app, check user.role.

    let profile = await TransporterProfile.findOne({ where: { user_id: userId } });

    if (profile) {
        await profile.update({ company_name, license_number });
        return res.json({ success: true, message: 'Profile updated', data: profile });
    }

    profile = await TransporterProfile.create({
        user_id: userId,
        company_name,
        license_number
    });

    res.status(201).json({ success: true, message: 'Transporter profile created', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add Vehicle
exports.addVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_number, vehicle_type, capacity_kg, is_refrigerated } = req.body;

    const vehicle = await Vehicle.create({
        transporter_id: userId,
        vehicle_number,
        vehicle_type,
        capacity_kg,
        is_refrigerated
    });

    res.status(201).json({ success: true, message: 'Vehicle added', data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Fleet
exports.getFleet = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicles = await Vehicle.findAll({ where: { transporter_id: userId } });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
