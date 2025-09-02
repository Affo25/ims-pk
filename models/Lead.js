import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
    },
    bound: {
      type: String,
    },
    request: {
      type: String,
      required: true,
    },
    sale: {
      type: String,
    },
    contact_status: {
      type: String,
    },
    solution: {
      type: mongoose.Schema.Types.Mixed,
    },
    comments: {
      type: String,
    },
    user_id: {
      type: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'DELETED', 'NEW'],
      default: 'ACTIVE',
    },
    activity: [
      {
        message: { type: String, trim: true },
        date_time: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // auto manages
    collection: 'leads',
  }
);

// Ensure updated_at updates on save (though timestamps does this already)
leadSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
