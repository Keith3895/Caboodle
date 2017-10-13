var userHandler			= 		require('../data_handles/user');


module.exports.Login	= 		function(req,res,callback){
	console.log("logging User In");
	userHandler.authenticate(req,res,callback);
}
module.verifyEmail		=		function(token,callback){
	userHandler.verifyEmail(token,callback);
}