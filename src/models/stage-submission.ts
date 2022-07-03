// Stage submission model

import mongoose from 'mongoose';

const stageSubmissionSchema = new mongoose.Schema({
	_id: String,
	difficulty: {
		type: String,
		enum: ['Mega Easy', 'Easy', 'Medium', 'Hard', 'Extreme'],
		required: false,
	},
	payment: {
		type: Number,
		required: false,
	}, /* percent */
	accepted: {
		type: Boolean,
		default: false,
		required: true,
	},
});

export default mongoose.model('StageSubmission', stageSubmissionSchema);
