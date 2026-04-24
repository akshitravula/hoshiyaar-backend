import mongoose from 'mongoose';

const { Schema } = mongoose;

const UnitSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 1 }, // Supports fractional values for easy insertion (e.g., 1.5)
}, { timestamps: true });

UnitSchema.index({ chapterId: 1, title: 1 }, { unique: true });

export default mongoose.model('Unit', UnitSchema);


