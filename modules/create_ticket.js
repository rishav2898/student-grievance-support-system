const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sgss', {useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true});
var conn = mongoose.Collection;
var create_ticket_Schema = new mongoose.Schema ({
	User: {
		type: String,
	},
	TicketSubject: {
		type: String,
		required: true,
	},
	Periority: {
		type: String,
		required: true,
	},
	TicketCategory: {
		type: String,
		required:  true,
	},
	TicketBody: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now
	}
});

var CreateTicketModel = mongoose.model('create_ticket', create_ticket_Schema);
module.exports = CreateTicketModel;