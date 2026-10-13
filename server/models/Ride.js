const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    location: { type: String, required: true, trim: true },
    estimatedTime: { type: String, trim: true }, // e.g. "09:15"
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    stops: {
      type: [stopSchema],
      default: [],
    },
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      match: [/^\d{2}:\d{2}$/, 'Use HH:MM format for departure time'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'At least 1 seat required'],
      max: [8, 'Maximum 8 seats allowed'],
    },
    availableSeats: {
      type: Number,
      min: [0, 'Available seats cannot be negative'],
    },
    vehicle: {
      type: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    estimatedTripCost: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    costPerPassenger: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed', 'full'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Set availableSeats = totalSeats on creation
rideSchema.pre('save', function (next) {
  if (this.isNew && this.availableSeats === undefined) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Auto-set status to 'full' when no seats remain
rideSchema.pre('save', function (next) {
  if (!this.isNew && this.availableSeats === 0 && this.status === 'active') {
    this.status = 'full';
  }
  if (this.availableSeats > 0 && this.status === 'full') {
    this.status = 'active';
  }
  next();
});

// Indexes
rideSchema.index({ travelDate: 1 });
rideSchema.index({ origin: 'text', destination: 'text' });
rideSchema.index({ driver: 1 });
rideSchema.index({ status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
