var studentHandler    =     require('../data_handles/student');
var userHandler       =     require('../data_handles/user');
var placementHandler  =     require('../data_handles/placement');
module.exports ={
  listPlacementsInternships            :     function(searchParameter,selectArray,populate,callback){
    placementHandler.findAllPlacement(searchParameter,selectArray,populate,function(cpny){
    	placementHandler.findAllInternship(searchParameter,selectArray,populate,function(internships){
    		callback({cpny:cpny,internships:internships});
    	});
    });
  },
  findPlacement 					   : 	 function(searchParameter,selectArray,populate,callback){
  	placementHandler.findOnePlacement(searchParameter,selectArray,populate,callback);
  },
  
};