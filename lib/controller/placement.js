
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
          var mailParameters = {
            subject: placement.cName+'- New Placement Update',
            templateData: {placement: placement},
            mailAttachments: uploadedFiles.mailAttachments
          }
          var selectArray = ['author'];
          var populate = {
              path:'author',
              model:'User',
              select:{'email':1},
              match:{college:'amcec'}
          };
          studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
            mailParameters.mails=mails;
            emailController.sendMail(mailParameters,uploadedFiles,'addPlacement',function(error,info){
                callback(error,info);
            });
          });
        });
      });    
    });  
  },
  
  updatePlacement                    :   function(req,searchParameter,callback){
    fileUploaderComponent.uploadFiles(req.files.docs,'PlacementUploads/',function(uploadedFiles){
      cfuncs.formatPlacement(req.body,req.user,function(placementDetails,searchCondition){
        placementDetails.doc_links=uploadedFiles.links;
        placementHandler.editPlacement(searchParameter,placementDetails,function(updatedPlacement){
          var mailParameters = {
            subject: updatedPlacement.cName+'- ALERT! Placement Info Updated',
            templateData: {placement: updatedPlacement},
            mailAttachments: uploadedFiles.mailAttachments
          }
          var selectArray = ['author'];
          var populate = {
              path:'author',
              model:'User',
              select:{'email':1},
              match:{college:'amcec'}
          };
          studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
            mailParameters.mails=mails;
            emailController.sendMail(mailParameters,uploadedFiles,'updatePlacement',function(error,info){
                callback(error,info);
            });
          });
        });
      });    
    });  
  },
  
  addNewInternship                    :   function(req,callback){
    fileUploaderComponent.uploadFiles(req.files.docs,'InternshipUploads/',function(uploadedFiles){
      cfuncs.formatInternship(req.body,req.user,function(newInternship,searchCondition){
        newInternship.doc_links=uploadedFiles.links;
        placementHandler.addInternship(newInternship,function(internship){
          var mailParameters = {
            subject: internship.cName+'- New Internship Update',
            templateData: {internship: internship},
            mailAttachments: uploadedFiles.mailAttachments
          }
          var selectArray = ['author'];
          var populate = {
              path:'author',
              model:'User',
              select:{'email':1},
              match:{college:'amcec'}
          };
          studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
            mailParameters.mails=mails;
            emailController.sendMail(mailParameters,uploadedFiles,'addInternship',function(error,info){
                callback(error,info);
            });
          });
        });
      });    
    });  
  },
  
  updateInternship                   :   function(req,searchParameter,callback){
    fileUploaderComponent.uploadFiles(req.files.docs,'InternshipUploads/',function(uploadedFiles){
      cfuncs.formatInternship(req.body,req.user,function(internshipDetails,searchCondition){
        internshipDetails.doc_links=uploadedFiles.links;
        placementHandler.editInternship(searchParameter,internshipDetails,function(updatedInternship){
          var mailParameters = {
            subject: updatedInternship.cName+'- ALERT! Internship Info Updated',
            templateData: {internship: updatedInternship},
            mailAttachments: uploadedFiles.mailAttachments
          }
          var selectArray = ['author'];
          var populate = {
              path:'author',
              model:'User',
              select:{'email':1},
              match:{college:'amcec'}
          };
          studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
            mailParameters.mails=mails;
            emailController.sendMail(mailParameters,uploadedFiles,'updateInternship',function(error,info){
                callback(error,info);
            });
          });
        });
      });    
    });  
  }
};