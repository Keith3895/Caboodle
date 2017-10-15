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

//componenets
var fileUploadComponent = require('../components/fileUploader');
var emailComponent = require('../components/email');

//custom functions
var cfuncs = require('../CustomFunctions/functions');

          
module.exports ={
    //parameters passed in sendMail is an object which has mail 'subject', 'templateData','mailAttachments' and 'mails' 
	sendMail : function(parameters,routeType,callback){
	   var attachments = (parameters.mailAttachments)?parameters.mailAttachments:"";
    	cfuncs.getRenderedTemplate(parameters.templateData,routeType,function(html){
            var mailOptions = {
                from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                to: 'bkm.blore@gmail.com, '+parameters.mails, // list of receivers
                subject: parameters.subject, // Subject line
                html: html, //, // plaintext body
                attachments: attachments
            }; 
            emailComponent.sendEmail(mailOptions,function(error,info){
                callback(error,info);
            })
    	})
	}
}
