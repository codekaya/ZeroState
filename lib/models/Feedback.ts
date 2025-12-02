import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type FeedbackCategory = 'facilities' | 'food' | 'events' | 'community' | 'ideas';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved';

export interface IFeedback extends Document {
  _id: mongoose.Types.ObjectId;
  content: string;
  category: FeedbackCategory;
  isAnonymous: boolean;
  authorNullifier?: string;
  authorId?: Types.ObjectId;
  zkProof: any;
  status: FeedbackStatus;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    category: {
      type: String,
      enum: ['facilities', 'food', 'events', 'community', 'ideas'],
      required: true,
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      required: true,
      default: true,
    },
    authorNullifier: {
      type: String,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      index: true,
    },
    zkProof: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open',
      index: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FeedbackSchema.index({ category: 1 });
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ authorNullifier: 1 });
FeedbackSchema.index({ authorId: 1 });

const Feedback: Model<IFeedback> = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;

