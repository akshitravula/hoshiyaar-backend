import mongoose from 'mongoose';

const { Schema } = mongoose;

const BoardSchema = new Schema({
  name: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model('Board', BoardSchema);


