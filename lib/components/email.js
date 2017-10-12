var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    auth: {
        user: 'bkm.blore.c9@gmail.com', // Your email id
        pass: 'cloudnine' // Your password
    }
});

// ===================================================
// var transporter = nodemailer.createTransport(ses({
    // accessKeyId: 'process.env.MailerKeyid',
//     secretAccessKey: 'process.env.MailerPsd'
// }));

module.exports.sendEmail = function(mailOptions,callback){
    transporter.sendMail(mailOptions, function(error, info){
        if(error) console.log(error);
        callback(error,info);
    });
}