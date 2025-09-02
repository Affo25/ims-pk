import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  inquiry_id: {
    type: String,
    ref: 'Inquiry',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  start_datetime: {
    type: Date,
    required: true,
  },
  end_datetime: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  logistics: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'FINISHED', 'CANCELLED'],
    default: 'ACTIVE',
  },
  cancel_reason: {
    type: String,
    required: false,
  },
  activity: [{
    message: String,
    date_time: Date,
  }],
  created_by: {
    type: String,
    ref: 'User',
    required: true,
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
  collection: 'events'
});

eventSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);