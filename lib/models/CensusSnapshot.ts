import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICensusSnapshot extends Document {
  _id: mongoose.Types.ObjectId;
  timestamp: Date;
  totalMembers: number;
  activeMembers: number; // Active in last 24h
  merkleRoot: string;
  demographics: {
    ageRanges?: { [range: string]: number };
    locations?: { [location: string]: number };
    skills?: { [skill: string]: number };
    [key: string]: any;
  };
  zkProof?: any; // ZK proof for member count verification
}

const CensusSnapshotSchema = new Schema<ICensusSnapshot>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalMembers: {
      type: Number,
      required: true,
    },
    activeMembers: {
      type: Number,
      required: true,
      default: 0,
    },
    merkleRoot: {
      type: String,
      required: true,
    },
    demographics: {
      type: Schema.Types.Mixed,
      default: {},
    },
    zkProof: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes
CensusSnapshotSchema.index({ timestamp: -1 });
CensusSnapshotSchema.index({ merkleRoot: 1 });

const CensusSnapshot: Model<ICensusSnapshot> =
  mongoose.models.CensusSnapshot || mongoose.model<ICensusSnapshot>('CensusSnapshot', CensusSnapshotSchema);

export default CensusSnapshot;

