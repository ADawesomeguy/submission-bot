// Stage submission model

import mongoose from 'mongoose';

const stageSubmissionSchema = new mongoose.Schema({
	_id: String,
	authorId: {
		type: String,
		required: true,
	},
	difficulty: {
		type: String,
		enum: ['Mega Easy', 'Easy', 'Medium', 'Hard', 'Extreme'],
		required: false,
	},
	paymentPercentage: {
		type: Number,
		required: false,
	}, /* percent */
	accepted: {
		type: Boolean,
		default: false,
		required: true,
	},
	paymentRequired: {
		type: Number,
	},
	payedOut: {
		type: Boolean,
		default: false,
		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
		required: true,
	},
	acceptanceMessageId: {
		type: String,
	},
});

export default mongoose.model('StageSubmission', stageSubmissionSchema);
