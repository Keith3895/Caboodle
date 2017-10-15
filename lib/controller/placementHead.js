var studentHandler    =     require('../data_handles/student');
var userHandler       =     require('../data_handles/user');

module.exports     = {
	addPlacementHead				: 			function(body,callback){
		body.userType= "placementHead";
		userHandler.addUser(body,callback);
	}, 
};