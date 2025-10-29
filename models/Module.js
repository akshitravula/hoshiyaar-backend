import mongoose from 'mongoose';

const { Schema } = mongoose;

const ModuleSchema = new Schema({
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  title: { type: String, required: true },
  order: { type: Number, default: 1 },
}, { timestamps: true });

ModuleSchema.index({ chapterId: 1, title: 1 });
ModuleSchema.index({ unitId: 1, title: 1 }, { unique: true, partialFilterExpression: { unitId: { $exists: true } } });

export default mongoose.model('Module', ModuleSchema);


