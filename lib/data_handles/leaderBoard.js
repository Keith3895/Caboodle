var mongoose            = 	require("mongoose");

var LeaderBoard = require("../../models/leaderboard");
var GlobalLeaderBoard = require("../../models/globalLeaderBoard");

mongoose.connection.openUri(process.env.mongoURL);     // local mongo db

module.exports.createLeaderBoard			=		function(data,callback){
	LeaderBoard.create(data,function(err,entered){
		if(err)console.log(entered);
		callback(entered);
	});
}


module.exports.getCurrent					=		function(searchParameter,callback){
	LeaderBoard.find({}).sort({'_id':-1}).limit(1).exec(function(err, entry) {
		if(err)console.log(err);
		callback(entry);
	});
}




module.exports.removeLeader					=		function(searchParameter,callback){
	LeaderBoard.remove(searchParameter,function(err,stat){
		if(err)console.log(err);
		callback(stat);
	});
}

module.exports.removeGLeader					=		function(searchParameter,callback){
	GlobalLeaderBoard.remove(searchParameter,function(err,stat){
		if(err)console.log(err);
		callback(stat);
	});
}