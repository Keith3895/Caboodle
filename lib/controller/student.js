var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');

module.exports ={
	addStudent 			: 			function(body,callback){
		var usn = body.usn;
	    var newUser = {
	        email: body.email,
	        firstName: body.firstName,
	        lastName: body.lastName,
	        gender: body.gender,
	        usn: usn.toUpperCase(),
	        userType: "student"
	    };
	    userHandler.addUser(newUser,function(addedUser){
	    	var newStudent = {
	            author: addedUser._id,
	            semester: body.sem,
	            USN: usn.toUpperCase(),
	            department: body.department
	        };
	    	studentHandler.addStudent(newStudent,function(addedStudent){
	    		addedStudent.authToken = addedUser.authToken;
	    		callback(addedStudent);
	    	});	
	    });
	},
	findStudent 		: 			function(id,selectArray,populate,callback){
		studentHandler.findOne({_id:id},selectArray,populate,callback);
	},
	getEmailIDs	:	function(searchCondition,selectArray,populate,callback){
		studentHandler.findAll(searchCondition,selectArray,populate,callback);
	}
};