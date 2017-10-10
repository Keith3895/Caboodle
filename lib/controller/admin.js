var UserDataHandler 		= 		require('../data_handles/user');

module.exports ={
	signUp 				: 			function(body,callback){

		var newUser = {
	        email: body.email,
	        firstName: body.firstName,
	        lastName: body.lastName,
	        userType: "admin"
	    };
		UserDataHandler.addUser(newUser,function(addedUser){
			// we can send email from here or
			// send the user data back to the route and send it from there.
			callback(addedUser);
		});
	},
	Login				: 			function(req,res,callback){
		console.log("logging User In");
		UserDataHandler.authenticate(req,res,callback);
	},
	list				: 			function(college,callback){
		UserDataHandler.findAll({college:college,userType:'admin'},callback);
	},
	GetInfo 			: 			function(detail,callback){
		UserDataHandler.findOne({_id:detail._id},callback);
	},
};