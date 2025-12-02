import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMember extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  identityCommitment: string;
  joinedAt: Date;
  status: 'active' | 'inactive';
  attributes?: {
    skills?: string[];
    location?: string;
    ageRange?: string;
    [key: string]: any;
  };
}

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    identityCommitment: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
MemberSchema.index({ email: 1 });
MemberSchema.index({ identityCommitment: 1 });
MemberSchema.index({ status: 1 });

const Member: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);

export default Member;

