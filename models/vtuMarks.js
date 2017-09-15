var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Subjects = new Schema({
	subjectCode: String,
	subjectName: String,
	internalMarks: Number,	
	externalMarks: Number,
	subTotal: Number,
	subResult: String
});

var Marks = new Schema({
	sem:Number,
	subjects:[Subjects],
	total: Number,
	result: String
});

var vtuMarksSchema = new Schema({
	name: String,
	usn: String,
	department: String,
	marks:[Marks]
});

module.exports = mongoose.model("vtuMarks", vtuMarksSchema);