const User = require('../models/User');

/**
 * GET /api/users/me
 */
const getMyProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/**
 * PATCH /api/users/me
 * Allows updating name, phone, role, bio, vehicle, profilePhoto.
 * Password changes not handled here — handled separately if needed.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'role', 'bio', 'vehicle', 'profilePhoto'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, updateMyProfile };
