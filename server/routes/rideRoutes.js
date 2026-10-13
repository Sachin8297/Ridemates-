const express = require('express');
const { body } = require('express-validator');
const {
  createRide, getRides, getRideById, updateRide, cancelRide, getMyRides,
} = require('../controllers/rideController');
const { createRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const rideValidation = [
  body('origin').trim().notEmpty().withMessage('Origin is required.'),
  body('destination').trim().notEmpty().withMessage('Destination is required.'),
  body('travelDate').isISO8601().withMessage('Valid travel date required.'),
  body('departureTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Departure time must be HH:MM format.'),
  body('totalSeats')
    .isInt({ min: 1, max: 8 })
    .withMessage('Total seats must be between 1 and 8.'),
  body('costPerPassenger')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost per passenger must be 0 or more.'),
];

// ── Protected routes with specific prefixes (MUST come before /:id) ──────────

// GET /api/rides/user/my — must be before /:id so Express doesn't swallow "user" as an id param
router.get('/user/my', protect, getMyRides);

// POST /api/rides — create a new ride (protected)
router.post('/', protect, rideValidation, validate, createRide);

// ── Public routes ─────────────────────────────────────────────────────────────

router.get('/', getRides);

// ── Routes with :id param ─────────────────────────────────────────────────────

router.get('/:id', getRideById);
router.patch('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);

// POST /api/rides/:id/requests — send a seat request (protected)
router.post(
  '/:id/requests',
  protect,
  [
    body('seatsRequested')
      .optional()
      .isInt({ min: 1, max: 4 })
      .withMessage('Seats requested must be 1–4.'),
  ],
  validate,
  createRequest
);

module.exports = router;
