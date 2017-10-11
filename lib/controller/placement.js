
//   data handles
var studentHandler    =     require('../data_handles/student');
var userHandler       =     require('../data_handles/user');
var placementHandler  =     require('../data_handles/placement');

// controllers
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
  AddNewPlacement                    :   function(body,callback){
    component.fileUploader.upload(body.file.docs,function(filePaths){
      funcs.formatPlacement(body,function(newPlacement){
        studentHandler.addPlacement(newPlacement,async function(placement){
          var searchCondition=await funcs.ComputeRegex();
          var selectArray = ['author'];
          var populate = {
              path:'author',
              model:'User',
              select:{'email':1}
          };
          studentController.getEmailIDs(searchCondition,selectArray,populate,function(ToIds){
            component.email.createMail(ToIds,placement,function(mail){
              component.email.sendmail(mail,callback);    
            });
          });
        });    
      });  
    });
  },
};