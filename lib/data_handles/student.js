var mongoose            = 	require("mongoose");

var Student				=	  require('../../models/student');
var User                  =   require('../../models/user');
mongoose.connection.openUri(process.env.mongoURL);     // local mongo db

module.exports.findOne = function(searchParameters,selectArray,populate, callback){

  Student.findOne(searchParameters,selectArray).populate(populate).exec( function(err, student){
    if ( err ) console.log(err);
    // console.log(student);
    callback(student);
  });
}

module.exports.addStudent = function(StudentData, callback){
	Student.create(StudentData, function(err, student){
  		if(err) console.log(err);
  		callback(student);
  	});
}

module.exports.findAll = function(searchParameters,selectArray,populate, callback){
	Student.find(searchParameters,selectArray).populate(populate).exec(function(err,students){
		if(err)console.log(err);
		callback(students);
	});
}
module.exports.editStudent = function(searchParameters,StudentData, callback){
	var update = { $set: StudentData};
	Student.update(searchParameters, update, function(err,status){
	});
}

module.exports.deleteStudent = function(searchParameters, callback){
  Student.remove(searchParameters, function(err, user) {
    if (err) console.log(err);
    callback(user);
  });
}