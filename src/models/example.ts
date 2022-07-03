// Example mongoose model

import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
	example: String,
});

export default mongoose.model('Example', exampleSchema);
