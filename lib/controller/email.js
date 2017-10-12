var User = require("../../models/user");
var Student = require("../../models/student");
var Placement = require("../../models/placement");
var Internship = require("../../models/internship");
var ejs = require('ejs');

var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');

var adminController = require('./admin');
var studentController = require('./student');
var placementController = require('./placement');

var fileUploadComponent = require('../components/fileUploader');
var emailComponent = require('../components/email');

let renderEmail = function(template,data){
    ejs.renderFile(template,data, function(err, html){
        if (err) return err;
        else{
            return html;
        }
    });
}

let sendMail = function(template,body,uploadedFiles,callback){
    var searchCondition={ semester: { $in: body.semesters } , department: { $in: body.departments }};
    var selectArray = ['author'];
    var populate = {
        path:'author',
        model:'User',
        select:{'email':1}
    };
    studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
        var mailOptions = {
            from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
            to: 'bkm.blore@gmail.com, '+mails, // list of receivers
            subject: body.subject, // Subject line
            html: renderEmail(template,body.templateData), //, // plaintext body
            attachments: uploadedFiles.mailAttachments
        };  
        emailComponent.sendEmail(mailOptions,function(error,info){
            callback(error,info);
        })
    });
}

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
	}
}