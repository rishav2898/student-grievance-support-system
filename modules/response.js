const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sgss', {useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true});
var conn = mongoose.Connection;
var ResponseSchema = new mongoose.Schema({
	userId: {
		type: String,
	},
	TicketCategory: {
		type: String,
		required: true,
	},
	response: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now
	}
});

var responseModel = mongoose.model('Response', ResponseSchema);
module.exports = responseModel;