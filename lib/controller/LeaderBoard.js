var LeaderBoardHandler  =  	require('../data_handles/leaderBoard');
var studentController  =  	require('./student');

module.exports.clearAll			=			function(college){
	LeaderBoardHandler.removeLeader({},function(stats){
		LeaderBoardHandler.removeGLeader({},function(stats){});
	});
}
module.exports.getStats			=			function(college,callback){
    LeaderBoardHandler.getCurrent({college:college},function(entry){
    	studentController.listStudents({college:college},['_id'],'',function(list){
    		questionset = entry.length;
        	entry=entry[0];
        	var Submit = entry.entry.length;
        	var total = list.length;
        	callback({Submit:Submit,total:total,questionset:questionset});
    	});
    	
    });
}