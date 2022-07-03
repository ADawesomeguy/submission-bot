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
});

export default mongoose.model('StageSubmission', stageSubmissionSchema);
