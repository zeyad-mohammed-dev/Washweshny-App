import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expiresAt: Date,
  },

  {
    timestamps: true,
  }
);

export const TokenModel =
  mongoose.model.Token || mongoose.model('Token', tokenSchema);

TokenModel.syncIndexes();
