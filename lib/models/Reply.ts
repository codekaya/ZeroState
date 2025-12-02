import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IReply extends Document {
  _id: mongoose.Types.ObjectId;
  feedbackId: Types.ObjectId;
  content: string;
  isAnonymous: boolean;
  authorNullifier?: string;
  authorId?: Types.ObjectId;
  zkProof: any;
  createdAt: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    feedbackId: {
      type: Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
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
    },
    zkProof: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
ReplySchema.index({ feedbackId: 1 });
ReplySchema.index({ authorNullifier: 1 });
ReplySchema.index({ createdAt: 1 });

const Reply: Model<IReply> = mongoose.models.Reply || mongoose.model<IReply>('Reply', ReplySchema);

export default Reply;

