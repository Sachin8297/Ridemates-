const express = require('express');
const { body } = require('express-validator');
const { getMyProfile, updateMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);

router.patch(
  '/me',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required.'),
    body('role')
      .optional()
      .isIn(['passenger', 'driver', 'both'])
      .withMessage('Role must be passenger, driver, or both.'),
    body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters.'),
  ],
  validate,
  updateMyProfile
);

module.exports = router;
