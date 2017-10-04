var mongoose = require("mongoose");

var PlacementSchema = new mongoose.Schema({
	cName: String,
	Package: String,
	jobLocation: String,
	qualification: String,
	department: String,
	skills: String,
	designation: String,
	driveLocation: String,
	date: String,
	time: String,
	eligibility: String,
	jobDescription: String, 
	doc_links: [String],
	author: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	},
	registeredStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "Student",
	    unique : true,
	    sparse:true
	}],
	selectedStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "Student",
	    unique : true,
	    sparse:true
	}]
});

module.exports = mongoose.model("placement", PlacementSchema);