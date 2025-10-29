import mongoose from 'mongoose';

const userIncorrectQuestionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		questionId: { type: String, required: true, index: true },
		moduleId: { type: String, index: true },
		chapterId: { type: String, index: true },
		firstSeenAt: { type: Date, default: Date.now },
		lastSeenAt: { type: Date, default: Date.now },
		count: { type: Number, default: 1 }
	},
	{ timestamps: true }
);

userIncorrectQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.model('UserIncorrectQuestion', userIncorrectQuestionSchema);
