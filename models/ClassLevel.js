import mongoose from 'mongoose';

const { Schema } = mongoose;

const ClassLevelSchema = new Schema({
  // Link class/grade to a board (e.g., CBSE Class 5)
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  // e.g., 1, 2, 3, ..., 12 or strings like "Grade 5"
  name: { type: String, required: true },
  // Optional numeric order for sorting when names are strings
  order: { type: Number, default: 1 },
}, { timestamps: true });

// Unique per board + class name
ClassLevelSchema.index({ boardId: 1, name: 1 }, { unique: true });

export default mongoose.model('ClassLevel', ClassLevelSchema);



