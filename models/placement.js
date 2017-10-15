var mongoose = require("mongoose");
var cfuncs = require('../lib/CustomFunctions/functions');

var PlacementSchema = new mongoose.Schema({
	cName: String,
	Package: String,
	jobLocation: String,
	qualification: String,
	department: String,
	skills: String,
	designation: String,
	driveLocation: String,
	driveDate: String,
	lastDate: String,
	eligibility: String,
	jobDescription: String, 
	doc_links: [String],
	author: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	},
	registeredStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "Student"
	},{
	     unique : true,
	     sparse:true
	}],
	selectedStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "Student"
	},{
	     unique : true,
	     sparse:true
	}]
});

PlacementSchema.pre('remove', function(next) {
  console.log("in Pre");
	this.model('Student').find({_id:{$in:this.registeredStudents}}).exec(function(err,students){
        if(err) console.log("Placement delete error: ",err)
        else{
            if(students!==null){
                students.forEach(function(student){
                    if(cfuncs.has(student.registeredPlacements,this._id)){
                       cfuncs.remove(student.registeredPlacements,this._id);
                        student.save();
                    }
                    if(cfuncs.has(student.selectedPlacements,this._id)){
                       cfuncs.remove(student.selectedPlacements,this._id);
                        student.save();
                    }
                })
            }
			next();
        }
	});
});

module.exports = mongoose.model("placement", PlacementSchema);