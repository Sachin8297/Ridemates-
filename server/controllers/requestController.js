const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');

/**
 * POST /api/rides/:id/requests
 * Passenger requests to join a ride.
 */
const createRequest = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own ride.' });
    }

    if (['cancelled', 'completed'].includes(ride.status)) {
      return res.status(400).json({ success: false, message: 'This ride is no longer available.' });
    }

    const { seatsRequested = 1, pickupLocation, message } = req.body;

    if (seatsRequested > ride.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.availableSeats} seat(s) available.`,
      });
    }

    // Check for existing active request from this passenger
    const existingRequest = await RideRequest.findOne({
      ride: ride._id,
      passenger: req.user._id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active request for this ride.',
      });
    }

    const request = await RideRequest.create({
      ride: ride._id,
      passenger: req.user._id,
      seatsRequested,
      pickupLocation,
      message,
    });

    const populated = await request.populate([
      { path: 'passenger', select: 'name email profilePhoto phone' },
      { path: 'ride', select: 'origin destination travelDate departureTime' },
    ]);

    res.status(201).json({ success: true, message: 'Request sent.', request: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests/sent
 * All requests the current user has sent.
 */
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await RideRequest.find({ passenger: req.user._id })
      .populate('ride', 'origin destination travelDate departureTime driver status costPerPassenger')
      .populate({ path: 'ride', populate: { path: 'driver', select: 'name profilePhoto' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/requests/received
 * All requests for rides the current user has posted.
 */
const getReceivedRequests = async (req, res, next) => {
  try {
    // Find all rides owned by this user
    const myRides = await Ride.find({ driver: req.user._id }).select('_id');
    const rideIds = myRides.map((r) => r._id);

    const requests = await RideRequest.find({ ride: { $in: rideIds } })
      .populate('passenger', 'name email profilePhoto phone')
      .populate('ride', 'origin destination travelDate departureTime')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/requests/:requestId
 * Driver: accept or reject. Passenger: cancel.
 */
const updateRequest = async (req, res, next) => {
  try {
    const request = await RideRequest.findById(req.params.requestId).populate('ride');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const { status } = req.body;
    const isDriver = request.ride.driver.toString() === req.user._id.toString();
    const isPassenger = request.passenger.toString() === req.user._id.toString();

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ success: false, message: 'Not authorised.' });
    }

    // Validate allowed status transitions
    if (isDriver && !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Driver can only accept or reject requests.' });
    }

    if (isPassenger && status !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Passenger can only cancel requests.' });
    }

    if (request.status !== 'pending' && !(isPassenger && request.status === 'accepted')) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a request with status: ${request.status}`,
      });
    }

    const ride = request.ride;

    if (status === 'accepted') {
      if (ride.status !== 'active') {
        return res.status(400).json({ success: false, message: 'Ride is not available.' });
      }
      if (request.seatsRequested > ride.availableSeats) {
        return res.status(400).json({
          success: false,
          message: `Only ${ride.availableSeats} seat(s) available.`,
        });
      }
      // Decrement available seats
      ride.availableSeats -= request.seatsRequested;
      await ride.save();
    }

    if (status === 'cancelled' && request.status === 'accepted') {
      // Return seats to the ride
      ride.availableSeats += request.seatsRequested;
      await ride.save();
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    const updated = await request.populate([
      { path: 'passenger', select: 'name email profilePhoto' },
      { path: 'ride', select: 'origin destination travelDate departureTime' },
    ]);

    res.json({ success: true, message: `Request ${status}.`, request: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRequest, getSentRequests, getReceivedRequests, updateRequest };
