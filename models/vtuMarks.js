var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Subjects = new Schema({
	subjectCode: { type : String , unique : true, sparse:true},
	subjectName: String,
	internalMarks: Number,	
	externalMarks: Number,
	subTotal: Number,
	subResult: String,
	attempt: Number
},{_id: false});

var Marks = new Schema({
	sem:{ type : Number , unique : true, sparse:true},
	subjects:[Subjects],
	total: Number,
	result: String
},{_id: false});

var vtuMarksSchema = new Schema({
	name: String,
	usn: String,
	department: String,
	marks:[Marks]
});

module.exports = mongoose.model("vtuMarks", vtuMarksSchema);