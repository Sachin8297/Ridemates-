const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seatsRequested: {
      type: Number,
      required: true,
      min: [1, 'At least 1 seat must be requested'],
      max: [4, 'Cannot request more than 4 seats at once'],
    },
    pickupLocation: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: [300, 'Message cannot exceed 300 characters'],
    },
    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent duplicate active requests (pending/accepted) from same passenger for same ride
rideRequestSchema.index(
  { ride: 1, passenger: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'accepted'] } },
  }
);

// General index for queries
rideRequestSchema.index({ passenger: 1 });
rideRequestSchema.index({ ride: 1 });

module.exports = mongoose.model('RideRequest', rideRequestSchema);
