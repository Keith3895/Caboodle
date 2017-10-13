var mongoose            = 	require("mongoose");


var Questions 			= 	require("../../models/question");
var Context 			= 	require("../../models/context");

mongoose.connection.openUri(process.env.mongoURL);     // local mongo db


module.exports.AddQuestion 	= 		function(question,callback){
	Questions.create(question,function(err, questionEnter) {
       if(err)console.log(err);
       callback(questionEnter);
    });
}



module.exports.findQuestions 	=		function(searchParameters,callback){
	Questions.find(searchParameters,function(err, questionsSend) {
		if(err)console.log(err);
		callback(questionsSend);
	});
}
module.exports.AddContext 		=		function(context,callback){
	Context.create(context,function(err, questionEnter) {
       if(err)console.log(err);
       callback(questionEnter);
    });
}

module.exports.findContext 		= 		function(searchParameters,callback){
	Context.find(searchParameters,function(err, context) {
		if(err)console.log(err);
		callback(context);
	});
}

module.exports.removeQuestions 	=		function(searchParameters,callback){
	Questions.remove(searchParameters,function(err,stat) {
		if(err)console.log(err);
		callback(stat);
	});
}

module.exports.removeContext	= 		function(searchParameters,callback){
	Context.remove(searchParameters,function(err,stat){
		if(err)console.log(err);
		callback(stat);
	});
}