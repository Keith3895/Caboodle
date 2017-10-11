var User = require("../../models/user");
var Student = require("../../models/student");
var Placement = require("../../models/placement");
var Internship = require("../../models/internship");
var ejs = require('ejs');

var studentHandler 		= 		require('../data_handles/student');
var userHandler 		=		require('../data_handles/user');


let renderEmail = function(template,data){
    ejs.renderFile(template,data, function(err, html){
        if (err) return err;
        else{
            return html;
        }
    });
}

module.exports ={
	addPlacement 	: 	function(body,callback){
	    const template = './views/placement/email.ejs';
	    var mailOptions = {
            from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
            to: 'bkm.blore@gmail.com '+emails, // list of receivers
            subject: newDrive.cName+'- New Placement Update', // Subject line
            html: html, //, // plaintext body
            attachments: mailAttachments
        };
	}
}