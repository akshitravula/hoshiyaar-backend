import mongoose from 'mongoose';
const { Schema } = mongoose;

const lessonItemSchema = new Schema({
  moduleId: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
//   slide: {
//     type: Number,
//     required: true,
//   },
  type: {
    type: String,
    enum: ['concept', 'statement', 'fill-in-the-blank', 'multiple-choice', 'rearrange', 'comic'],
    required: true,
  },
  title: String,
  content: String,
  text: String,
  question: String,
  answer: { type: Schema.Types.Mixed, default: null },
  options: [String],
  words: [String],
  order: { type: Number, default: 0 }, // Supports fractional values
});

const LessonItem = mongoose.model('LessonItem', lessonItemSchema);

export default LessonItem;