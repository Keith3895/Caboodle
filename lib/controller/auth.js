var randomstring = require("randomstring");

var userHandler			= 		require('../data_handles/user');

var emailController		= 		require('./email');

module.exports.Login	= 		function(req,res,callback){
	console.log("logging User In");
	userHandler.authenticate(req,res,callback);
}
module.exports.verifyEmail		=		function(token,callback){
	userHandler.verifyEmail(token,callback);
}

module.exports.forgotPassword = function(email,callback){
	userHandler.findOne({email:email},function(user){
		if(!user){
			callback('error',"Email does not exist","",'');
		}else{
			var data={};
			data.verCode=randomstring.generate();
			data.firstName = user.firstName;
			//parameters passed in sendMail is an object which has mail 'subject', 'templateData','mailAttachments' and 'mails' 
			emailParameters = {
				subject: "GradBunker-Verification Code",
				templateData: data,
				mails: user.email
			};
			sendMail(emailParameters,'forgotPassword',function(err,info){
				if(err)callback('error',"Email does not exist","",'');
				else
					callback('success','Verification Code sent to mail.',data.verCode,user.email);		
			});
			
		}
	});
}
module.exports.resetPassword  = function(req,callback){
	userHandler.findOne({email:req.session.verMail},function(user){
		if(!user){
			callback('error');
		}else{
			userHandler.setPassword(user,req.body.pass,function(stat){
				if(stat=='success'){
                    callback('success');
				}else
					callback('err');
			});
		}
	});
}