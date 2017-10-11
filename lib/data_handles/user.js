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