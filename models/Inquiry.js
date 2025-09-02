import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: false,
  },
  bound: {
    type: String,
    required: false,
  },
  start_datetime: {
    type: Date,
    required: false,
  },
  end_datetime: {
    type: Date,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  fish: {
    type: String,
    required: false,
  },
  scope_of_work: {
    type: [String],
    required: false,
  },
  comments: {
    type: String,
    required: false,
  },
  lost_reason: {
    type: String,
    required: false,
  },
  follow_ups: {
    dates: [Date],
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['NEW', 'SUBMITTED', 'CONFIRMED', 'LOST'],
    default: 'NEW',
  },
  activity: [{
    message: String,
    date_time: Date,
  }],
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
  collection: 'inquiries'
});

inquirySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);