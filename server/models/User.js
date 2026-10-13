const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never return password in queries
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    role: {
      type: String,
      enum: ['passenger', 'driver', 'both'],
      default: 'passenger',
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    vehicle: {
      type: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      color: {
        type: String,
        trim: true,
      },
      licensePlate: {
        type: String,
        trim: true,
      },
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never expose the password field
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
