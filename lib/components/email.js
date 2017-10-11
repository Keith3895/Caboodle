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
