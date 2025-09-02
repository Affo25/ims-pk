import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'sessions'
});

// Auto-delete expired sessions
sessionSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Session || mongoose.model('Session', sessionSchema);