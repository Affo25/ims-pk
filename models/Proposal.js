import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  inquiry_id: {
    type: String,
    ref: 'Inquiry',
    required: true,
  },
  total_amount: {
    type: Number,
    required: true,
  },
  items: [{
    description: String,
    quantity: Number,
    unit_price: Number,
    total_price: Number,
  }],
  notes: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'],
    default: 'DRAFT',
  },
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
  collection: 'proposals'
});

proposalSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);