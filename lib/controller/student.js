var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');

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
			console.log("in updatedStudent" + updatedUser);
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
	getEmailIDs	:	function(searchCondition,selectArray,populate,callback){
		studentHandler.findAll(searchCondition,selectArray,populate,callback);
	}
};