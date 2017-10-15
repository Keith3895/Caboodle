var http 			= 		require('https');

var testHandler 		=	require('../data_handles/test');
var LeaderBoardHandler  =  	require('../data_handles/leaderBoard');
var externalUrl = "https://external-api-keithfranklin.c9users.io";


function ExternalCall (college){
    http.get(externalUrl+"/random/25", function(resp) {
    	var body = ''; 
    	resp.on('data', function(data){
    		body += data;
    	});
    	resp.on('end', function() {
    		var parsed = JSON.parse(body);
    		
    		dataRecieved= parsed;
    		timestamp = (new Date().getTime() / 1000 | 0).toString(16)+'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
                                return (Math.random() * 16 | 0).toString(16);
                            }).toLowerCase();
            LeaderBoardHandler.createLeaderBoard({testId:timestamp,college:college},function(err, entry) {
                console.log("lederboard created");
                dataRecieved.forEach(function(question){
	            	question.college = college;
	            	question.timestamp=timestamp;
	            	testHandler.AddQuestion(question,function(addedQuestion){
	            	});
            	});
            });
    	});
    })
    .on('error', function(e) {
    	console.log("Got error: " + e.message);
    });
    
    http.get(externalUrl+"/comp/get", function(resp) {
    	var body = ''; 
    	resp.on('data', function(data){
    		body += data;
    	});
    	resp.on('end', function() {
    		var parsed = JSON.parse(body);
    		var dataRecievedC= parsed;
            dataRecievedC.forEach(function(context){
            	context.college = college;
            	testHandler.AddContext(context,function(addedContext){
            	});
            });
    	});
    })
    .on('error', function(e) {
    	console.log("Got error: " + e.message);
    });
}


module.exports.requestQuestions 	= 	function(college,callback){
	testHandler.removeQuestions({college:college},function(stats){
		testHandler.removeContext({college:college},async function(stats){
			await ExternalCall(college);
			callback(stats);
		});
	});
}
module.exports.getQuestions 		=	function(college,callback){
    testHandler.findQuestions({college:college},function(questions){
    	testHandler.findContext({college:college},function(context){
    		callback({questions:questions,
    			context:context
    		});
    	});
    });
}

