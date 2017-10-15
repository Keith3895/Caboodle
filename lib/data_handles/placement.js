var mongoose            = 	require("mongoose");

var Student               =   require('../../models/student');
var User                  =   require('../../models/user');
var Placement             =   require('../../models/placement');
var Internship            =   require('../../models/internship');


mongoose.connection.openUri(process.env.mongoURL);     // local mongo db

module.exports.findOnePlacement = function(searchParameters,selectArray,populate, callback){

  Placement.findOne(searchParameters,selectArray).populate(populate).exec( function(err, placement){
    if ( err ) console.log(err);
    callback(err,placement);
  });
}

module.exports.addPlacement = function(PlacementData, callback){
	Placement.create(PlacementData, function(err, placement){
      if(err) console.log(err);
      callback(placement);
  	});
}

module.exports.findAllPlacement = function(searchParameters,selectArray,populate, callback){
	Placement.find(searchParameters,selectArray,function(err,placements){
		if(err)console.log(err);
    if(placements){
      placements = placements.filter(function(placements) {
              return placements.author;
          });
      callback(placements);
    }
	});
}
module.exports.editPlacement = function(searchParameters,PlacementData, callback){
// 	var update = { $set: PlacementData};
	Placement.findOneAndUpdate(searchParameters, PlacementData,{new: true, upsert: true}, function(err,updatedPlacement){
    if(err)console.log(err);
    callback(updatedPlacement);
	});
}

module.exports.deletePlacement = function(searchParameters, callback){
  Placement.remove(searchParameters, function(err, status) {
    if (err) console.log(err);
    callback(err,status);
  });
}

module.exports.findOneInternship = function(searchParameters,selectArray,populate, callback){

  Internship.findOne(searchParameters,selectArray).populate(populate).exec( function(err, internship){
    if ( err ) console.log(err);
    callback(err,internship);
  });
}

module.exports.addInternship = function(InternshipData, callback){
  Internship.create(InternshipData, function(err, internship){
      if(err) console.log(err);
      callback(internship);
    });
}

module.exports.findAllInternship = function(searchParameters,selectArray,populate, callback){
  Internship.find(searchParameters,selectArray,function(err,internships){
    if(err)console.log(err);
    internships = internships.filter(function(internships) {
            return internships.author;
        });
    callback(internships);
  });
}
module.exports.editInternship = function(searchParameters,InternshipData, callback){
  // var update = { $set: InternshipData};
  Internship.findOneAndUpdate(searchParameters, InternshipData,{new: true, upsert: true}, function(err,updatedInternship){
    if(err)console.log(err);
    callback(updatedInternship);
  });
}

module.exports.deleteInternship = function(searchParameters, callback){
  Internship.remove(searchParameters, function(err, status) {
    if (err) console.log(err);
    callback(status);
  });
}