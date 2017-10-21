var mongoose            = 	require("mongoose");
var passport 			= 	require("passport");
var User				=	require('../../models/user');


mongoose.connection.openUri(process.env.mongoURL);     // local mongo db

module.exports.findOne = function(searchParameters, callback){
  User.findOne(searchParameters, function(err, user){
    if ( err ) console.log(err);
    callback(user);
  });
}

module.exports.addUser = function(UserData, callback){
	User.register(UserData, 'amcec', function(err, user){
  		if(err) console.log(err);
  		callback(user);
  	});
}

module.exports.findAll = function(searchParameters, callback){
	User.find(searchParameters,function(err,users){
		if(err)console.log(err);
		callback(users);
	});
}

module.exports.editUser = function(searchParameters,UserData, callback){
	var update = { $set: UserData};
	User.update(searchParameters, update, function(err,status){
		callback(status);
	});
}

module.exports.deleteUser = function(searchParameters, callback){
	User.remove(searchParameters, function(err, user) {
                if (err) { 
                    console.log({"error": err});
                } else { 
                    req.flash("success","User removed");
                    callback(user);
                }
            })
}
module.exports.distinct = function(searchParameters,callback){
  User.distinct(searchParameters,function(err,dist){
    if(err)console.log(err);
    callback(dist);
  });
}
module.exports.authenticate = function(req,res,callback){

	passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
          if (err) { 
              req.flash("error","Invalid Credentials");
                res.redirect('/login'); 
          }
          else{
          redirectTo = req.session.redirectTo ? req.session.redirectTo : '/' + user.userType;
          delete req.session.returnTo;
          return res.redirect(redirectTo);
          }
        });   
    })(req, res, callback);
}
module.exports.verifyEmail  = function(token,callback){
  User.verifyEmail(token,function(err,stat){
    if(err)callback(err);
    else
      callback('success');
  });
}
module.exports.setPassword  = function(user,password,callback){
  user.setPassword(newPassword, function(error){  
    if(error){
      console.log(error);
      callback('err');
    }
     else{
         user.save(function(err2){
             if(err2){
                 console.log("Error in saving: "+err2);
                 callback('err');
             }
             else{
                callback("success");
             }
         }); 
      }
  });
}