import mongoose from 'mongoose';

const { Schema } = mongoose;

const SubjectSchema = new Schema({
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'ClassLevel', required: true },
  name: { type: String, required: true },
}, { timestamps: true });

// Unique per board, class, and name
SubjectSchema.index({ boardId: 1, classId: 1, name: 1 }, { unique: true });

export default mongoose.model('Subject', SubjectSchema);


