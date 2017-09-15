var mongoose = require("mongoose");

var StudentSchema = new mongoose.Schema({
	author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
	USN: { type : String , unique : true, required : true, dropDups: true },
	department: String,
	placements: Number,
	gender: String,
	books:[{bookID: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "book"
	},code: String}],
	DOB: String,
	semester: Number,
	mobile1: Number,
	address: String,
	tenthResult: { board: String, Percentage: Number, yearPassed: Number, reportLink: String},
	twelfthResult: { board: String, Percentage: Number, yearPassed: Number, reportLink: String},
	semResults: [{ sem: Number, Percentage: Number, reportLink: String}],
	PlacementTestResults:[{id:String,marks:String,typeCount: Array , typeCorrect:Array,type:Array}],
	semAggregate: Number,
	resumeLink: String,
	certifications: [{description: String, docLink: String}],
	registeredPlacements: [{
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "placement"
	}]
});


module.exports = mongoose.model("Student", StudentSchema);