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
	this.model('User').findOne({_id:this.author},function(err1,placementHead){
		if(err1) console.log(err1);
		else{
			this.model('User').find({'college':placementHead.college},{_id:1},function(err2,userIDs){
				if(err2) console.log(err2)
				else{
					userIDs= userIDs.map(function(ent){
						return ent._id;
					});
					this.model('Student').find({'author':{$in:userIDs}}).exec(function(err,students){
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
				}
		    
			})
		}
	});
});

module.exports = mongoose.model("internship", InternshipSchema);