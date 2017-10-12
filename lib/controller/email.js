var User = require("../../models/user");
var Student = require("../../models/student");
var Placement = require("../../models/placement");
var Internship = require("../../models/internship");

//data handles
var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');

//controllers
var adminController = require('./admin');
var studentController = require('./student');
var placementController = require('./placement');

//componenets
var fileUploadComponent = require('../components/fileUploader');
var emailComponent = require('../components/email');

//custom functions
var cfuncs = require('../CustomFunctions/functions');

module.exports ={
	MailForAddPlacement : 	function(body,uploadedFiles,callback){
	    const template = './views/emails/addPlacement.ejs';
	    sendMail(template,body,uploadedFiles,function(error,info){
	        if(error) console.log(error);
	        callback(error,info)
	    })
	},
	MailForAddInternship : 	function(body,uploadedFiles,callback){
	    const template = './views/emails/addInternship.ejs';
	    sendMail(template,body,uploadedFiles,function(error,info){
	        if(error) console.log(error);
	        callback(error,info)
	    })
	},
	sendMail : function(body,uploadedFiles,routeType,callback){
    	cfuncs.getRenderedTemplate(body,routeType,function(html){
            var selectArray = ['author'];
            var populate = {
                path:'author',
                model:'User',
                select:{'email':1}
            };
            studentController.getEmailIDs(body.searchCondition,selectArray,populate,function(mails){
                var mailOptions = {
                    from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                    to: 'bkm.blore@gmail.com, '+mails, // list of receivers
                    subject: body.subject, // Subject line
                    html: html, //, // plaintext body
                    attachments: uploadedFiles.mailAttachments
                };  
                emailComponent.sendEmail(mailOptions,function(error,info){
                    callback(error,info);
                })
            });
    	})
	}
}