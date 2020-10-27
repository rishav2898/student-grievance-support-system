const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sgss', {useNewUrlParser: true,  useCreateIndex: true, useUnifiedTopology: true});
var conn = mongoose.Collection;
var DepartmentSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		index: {
			unique: true,
		}},
	email: {
		type: String,
		required: true,
		index: {
			unique: true,
		}},
	department: {
		type: String,
		required: true,
		index: {
			unique: true,
		}},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});

var DepartmentModel = mongoose.model('dept', DepartmentSchema);
module.exports = DepartmentModel;