var UserDataHandler 		= 		require('../data_handles/user');

module.exports ={
	signUp 				: 			function(body,callback){
	    body.userType= "admin";
		UserDataHandler.addUser(body,function(addedUser){
			// we can send email from here or
			// send the user data back to the route and send it from there.
			callback(addedUser);
		});
	},
	Login				: 			function(req,res,callback){
		console.log("logging User In");
		UserDataHandler.authenticate(req,res,callback);
	},
	list				: 			function(callback){
		UserDataHandler.findAll({},callback);
	},
	GetInfo 			: 			function(detail,callback){
		UserDataHandler.findOne({_id:detail._id},callback);
	},
};