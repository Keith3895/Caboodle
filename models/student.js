var mongoose = require("mongoose");
var funcs = require('../lib/CustomFunctions/functions');

var StudentSchema = new mongoose.Schema({
	author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
	USN: { type : String , unique : true, sparse:true},
	department: String,
	gender: String,
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
	},{
	     unique : true,
	     sparse:true
	}],
	selectedPlacements: [{
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "placement"
	},{
	     unique : true,
	     sparse:true
	}],
	registeredInternships: [{
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "internship"
	},{
	     unique : true,
	     sparse:true
	}],
	selectedInternships:[{
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "internship"
	},{
	     unique : true,
	     sparse:true
	}]
});


StudentSchema.pre('remove', function(next) {
  console.log("in Pre");
    this.model('User').remove({ _id: this.author },
    function(err){
      if(!err) console.log("Removed from User") 
      else console.log(err);
    });
    this.model('GlobalLeaderBoard').remove({ author: this.author },
    function(err){
      if(!err) console.log("Removed from GlobalLeaderBoard") 
      else console.log(err);
    });
    this.model('foundItems').remove({ author: this.author },
    function(err){
      if(!err) console.log("Removed from foundItems") 
      else console.log(err);
    });
    this.model('lostItems').remove({ author: this.author },
    function(err){
      if(!err) console.log("Removed from lostItems") 
      else console.log(err);
    });
    this.model('sellItems').remove({ author: this.author },
    function(err){
      if(!err) console.log("Removed from sellItems") 
      else console.log(err);
    });
    this.model('placement').find({},function(err,placements){
        if(err) console.log("Internship delete error: ",err)
        else{
            if(placements!==null){
                placements.forEach(function(placement){
                    if(funcs.has(placement.registeredStudents,this._id)){
                       funcs.remove(placement.registeredStudents,this._id);
                        placement.save();
                    }
                    if(funcs.has(placement.selectedStudents,this._id)){
                       funcs.remove(placement.selectedStudents,this._id);
                        placement.save();
                    }
                })
            }
        }
	});
	this.model('internship').find({},function(err1,internships){
		if(err1) console.log("Internship delete error: ",err1)
		else{
		    if(internships!==null){
		        internships.forEach(function(internship){
		            if(funcs.has(internship.registeredStudents,this._id)){
		               funcs.remove(internship.registeredStudents,this._id);
		                internship.save();
		            }
		            if(funcs.has(internship.selectedStudents,this._id)){
		               funcs.remove(internship.selectedStudents,this._id);
		                internship.save();;
		            }
		        })
		    }
		}
	})
    next();
});



module.exports = mongoose.model("Student", StudentSchema);