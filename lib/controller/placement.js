
//   data handles
var placementHandler  =     require('../data_handles/placement');

//CustomFunctions
var cfuncs = require('../CustomFunctions/functions');

//Components
var fileUploaderComponent = require('../components/fileUploader');
 
//controllers
var emailController = require('./email');
var studentController =   require('./student');

module.exports ={
  listPlacementsInternships            :     function(searchParameter,selectArray,populate,callback){
    placementHandler.findAllPlacement(searchParameter,selectArray,populate,function(cpny){
    	placementHandler.findAllInternship(searchParameter,selectArray,populate,function(internships){
    		callback({cpny:cpny,internships:internships});
    	});
    });
  },
  findPlacement 					           : 	 function(searchParameter,selectArray,populate,callback){
  	placementHandler.findOnePlacement(searchParameter,selectArray,populate,callback);
  },
  findInternship                      :   function(searchParameter,selectArray,populate,callback){
    placementHandler.findOneInternship(searchParameter,selectArray,populate,callback);
  },
  addNewPlacement                    :   function(req,callback){
    fileUploaderComponent.uploadFiles(req.files.docs,'PlacementUploads/',function(uploadedFiles){
      cfuncs.formatPlacement(req.body,req.user,function(newPlacement,searchCondition){
        newPlacement.doc_links=uploadedFiles.links;
        placementHandler.addPlacement(newPlacement,function(placement){
          var body = {
            subject: placement.cName+'- New Placement Update',
            templateData: {placement: placement},
            searchCondition: searchCondition
          }
          emailController.sendMail(body,uploadedFiles,'addPlacement',function(error,info){
              callback(error,info);
          });
        });
      });    
    });  
  },
};