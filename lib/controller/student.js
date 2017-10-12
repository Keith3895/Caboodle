var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');
var placementController =		require('./placement');
var cfuncs = require('../CustomFunctions/functions');
module.exports ={
	addStudent 			: 			function(body,callback){
	        body.usn= body.usn.toUpperCase();
	        body.userType= "student";
	    userHandler.addUser(body,function(addedUser){
	    	var newStudent = {
	            author: addedUser._id,
	            semester: body.sem,
	            USN: body.usn,
	            department: body.department
	        };
	    	studentHandler.addStudent(newStudent,function(addedStudent){
	    		addedStudent.authToken = addedUser.authToken;
	    		callback(addedStudent);
	    	});	
	    });
	},
	findStudent 		: 			function(id,selectArray,populate,callback){
		studentHandler.findOne({author:id},selectArray,populate,callback);
	},
	UpdateStudent		:  			function(id,body,callback){
  		body.usn = body.usn.toUpperCase();
		userHandler.editUser({_id:id},body,function(updatedUser){
			body.semester= body.sem;
            body.USN= body.usn;
			studentHandler.editStudent({author:id},body,callback);	
		});
	},
	listStudents 		: 			function(searchParameters,selectArray,populate,callback){
		studentHandler.findAll(searchParameters,selectArray,populate,callback);
	}, 
	removeStudent 		: 			function(searchParameters,callback){
		studentHandler.deleteStudent(searchParameters,callback);
	},
	getEmailIDs			:	function(searchCondition,selectArray,populate,callback){
		studentHandler.findAll(searchCondition,selectArray,populate,function(emails){
			emails= emails.map(function(ent){
				return ent.author.email;
			});
	        callback(emails.join());
		});
	},
	registerPlacement   : 			 function(id,currentUser,callback){
		placementController.findPlacement({'_id':id},['registeredStudents'],'',function(record){
			if(record!==null){
				studentHandler.findOne({author:currentUser._id},[],'',function(student){
					if(!cfuncs.has(record.registeredStudents,student._id)){
                        record.registeredStudents.push(student._id);
                        record.save();
                        student.registeredPlacements.push(record._id);
                        student.save();
                        callback('success');
                    }else{
                    	callback('error');
                    }
				});
			}else{
                console.log("No such placement exists");
            }
		});
	}, 
	registerInternship   : 			 function(id,currentUser,callback){
		placementController.findInternship({'_id':id},['registeredStudents'],'',function(record){
			if(record!==null){ 
				studentHandler.findOne({author:currentUser._id},[],'',function(student){
					if(!cfuncs.has(record.registeredStudents,student._id)){
                        record.registeredStudents.push(student._id);
                        record.save();
                        student.registeredInternships.push(record._id);
                        student.save();
                        callback('success');
                    }else{
                    	callback('error');
                    }
				});
			}else{
                console.log("No such placement exists");
            }
		});
	}, 
};