import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: false,
  },
  designation: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
    enum: ['admin', 'user', 'manager', 'sales', 'accounts', 'marketing', 'development'],
  },
  country: {
    type: String,
    required: false,
  },
  areas: {
    type: [String],
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  avatar: {
    type: String,
    required: false,
  },
  birthday: {
    type: Date,
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'users'
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);