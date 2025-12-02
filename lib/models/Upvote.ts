import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IUpvote extends Document {
  _id: mongoose.Types.ObjectId;
  feedbackId: Types.ObjectId;
  nullifier: string;
  createdAt: Date;
}

const UpvoteSchema = new Schema<IUpvote>(
  {
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      index: true,
    },
    nullifier: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound unique index to prevent double voting
UpvoteSchema.index({ feedbackId: 1, nullifier: 1 }, { unique: true });

const Upvote: Model<IUpvote> = mongoose.models.Upvote || mongoose.model<IUpvote>('Upvote', UpvoteSchema);

export default Upvote;

