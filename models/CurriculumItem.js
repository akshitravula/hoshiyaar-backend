import mongoose from 'mongoose';

const { Schema } = mongoose;

const CurriculumItemSchema = new Schema({
  moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  order: { type: Number, default: 1 }, // Supports fractional values for easy insertion (e.g., 0.5, 1.5)
  type: { type: String, enum: ['statement', 'multiple-choice', 'rearrange', 'fill-in-the-blank', 'comic', 'descriptive'], required: true },
  text: String,
  question: String,
  options: [String],
  answer: String,
  words: [String],
  keywords: { type: [String], default: [] }, // Used for descriptive/subjective accuracy matching
  modelAnswers: { type: [String], default: [] }, // Used for up to 4 variations of descriptive correct answers
  imageUrl: { type: String },
  imagePublicId: { type: String },
  images: { type: [String], default: [] },
  imagePublicIds: { type: [String], default: [] },
}, { timestamps: true });

CurriculumItemSchema.index({ moduleId: 1, order: 1 });

export default mongoose.model('CurriculumItem', CurriculumItemSchema);


