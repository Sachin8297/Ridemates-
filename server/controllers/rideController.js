const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');
const { computeMatchScore } = require('../utils/matchRides');

/**
 * POST /api/rides
 * Create a new ride listing.
 */
const createRide = async (req, res, next) => {
  try {
    const {
      origin, destination, stops, travelDate, departureTime,
      totalSeats, vehicle, estimatedTripCost, costPerPassenger,
      currency, notes,
    } = req.body;

    const ride = await Ride.create({
      driver: req.user._id,
      origin,
      destination,
      stops: stops || [],
      travelDate,
      departureTime,
      totalSeats,
      vehicle,
      estimatedTripCost,
      costPerPassenger,
      currency,
      notes,
    });

    const populated = await ride.populate('driver', 'name email phone profilePhoto vehicle role');

    res.status(201).json({ success: true, message: 'Ride created.', ride: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rides
 * Search/filter rides.
 */
const getRides = async (req, res, next) => {
  try {
    const { origin, destination, date, time, seats, maxCost, page = 1, limit = 20 } = req.query;

    const query = { status: { $in: ['active', 'full'] } };

    if (date) {
      // Match any time on the given calendar date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: start, $lte: end };
    } else {
      // Only show future rides by default
      query.travelDate = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }

    if (seats) query.availableSeats = { $gte: Number(seats) };
    if (maxCost) query.costPerPassenger = { $lte: Number(maxCost) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Ride.countDocuments(query);

    let rides = await Ride.find(query)
      .populate('driver', 'name email profilePhoto vehicle role')
      .sort({ travelDate: 1, departureTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    // If origin/destination provided, add match scores and filter
    if (origin || destination) {
      rides = rides
        .map((ride) => {
          const { score, label } = computeMatchScore(ride, { origin, destination, departureTime: time });
          return { ride: ride.toObject(), score, matchLabel: label };
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ ride, score, matchLabel }) => ({ ...ride, matchScore: score, matchLabel }));
    } else {
      rides = rides.map((r) => r.toObject());
    }

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      rides,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rides/:id
 */
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name email phone profilePhoto vehicle role bio');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    res.json({ success: true, ride });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/rides/:id
 * Only the driver who created the ride can edit it.
 */
const updateRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found.' });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this ride.' });
    }

    if (ride.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot edit a completed ride.' });
    }

    const allowedFields = [
      'origin', 'destination', 'stops', 'travelDate', 'departureTime',
      'totalSeats', 'vehicle', 'estimatedTripCost', 'costPerPassenger',
      'currency', 'notes', 'status',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ride[field] = req.body[field];
      }
    });

    await ride.save();
    const updated = await ride.populate('driver', 'name email profilePhoto');

    res.json({ success: true, message: 'Ride updated.', ride: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/rides/:id
 * Marks the ride as cancelled; does not hard-delete.
 */
const cancelRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found.' });
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorised to cancel this ride.' });
    }

    if (ride.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Ride is already cancelled.' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // Cancel all pending requests for this ride
    await RideRequest.updateMany(
      { ride: ride._id, status: 'pending' },
      { status: 'cancelled', respondedAt: new Date() }
    );

    res.json({ success: true, message: 'Ride cancelled.' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/rides/my
 * Rides offered by the current user.
 */
const getMyRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRide, getRides, getRideById, updateRide, cancelRide, getMyRides };
