var mongoose = require("mongoose");
var cfuncs = require('../lib/CustomFunctions/functions');

var InternshipSchema = new mongoose.Schema({
	cName: String,
	Package: String,
	internLocation: String,
	duration: String,
	qualification: String,
	department: String,
	skills: String,
	designation: String,
	interviewLocation: String,
	lastDate: String,
	eligibility: String,
	internDescription: String, 
	doc_links: [String],
	author: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	},
	registeredStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	}],
	selectedStudents: [{
	    type: mongoose.Schema.Types.ObjectId,
	    ref: "User"
	}]
});

InternshipSchema.pre('remove', function(next) {
  console.log("in Pre");
	this.model('Student').find({'author':{$in:this.registeredStudents}}).exec(function(err,students){
        if(err) console.log("Internship delete error: ",err)
        else{
            if(students!==null){
                students.forEach(function(student){
                    if(cfuncs.has(student.registeredInternhsips,this._id)){
                       cfuncs.remove(student.registeredInternhsips,this._id);
                        student.save();
                    }
                    if(cfuncs.has(student.selectedInternhsips,this._id)){
                       cfuncs.remove(student.selectedInternhsips,this._id);
                        student.save();
                    }
                })
            }
			next();
        }
	});
});

module.exports = mongoose.model("internship", InternshipSchema);