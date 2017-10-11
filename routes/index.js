var express = require("express");
var router  = express.Router();
var ejs = require('ejs');
var passport = require("passport");
var User = require("../models/user");
var Student = require("../models/student");
var VTUmarks = require("../models/vtuMarks");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var cheerio = require('cheerio');
var request = require('request');
var Excel = require('exceljs');
const tempfile = require('tempfile');
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
var fs = require('fs');
var pdf = require('html-pdf');
var conversion = require("phantom-html-to-pdf")();
const template = './views/result/resultPdf.ejs';
var randomstring = require("randomstring");
require('dotenv').config();


var adminController = require('../lib/controller/admin');
var studentController = require('../lib/controller/student');


var transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: "smtp.gmail.com",
        auth: {
                    user: 'bkm.blore.c9@gmail.com', // Your email id
                    pass: 'cloudnine' // Your password
        }
});
var homeurl = process.env.homeUrl;
// var transporter = nodemailer.createTransport(ses({
//     accessKeyId: 'process.env.MailerKeyid',
//     secretAccessKey: 'process.env.MailerPsd'
// }));

// var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'SES',
//     host: 'email-smtp.us-east-1.amazonaws.com',
//     port: 465,
//     secure: true, // use TLS
//     auth: {
//         user: 'AKIAJNGUM74O5CZ6G5WA',
//         pass: 'AprH23smDvmmucNEwzyse2l25udtuPdhZ2/kan8hsLXf'
//     }
// }));
//root route

//******For updating any info in any DOCS change stuff and use it******
// router.get("/clean",function(req,res){
//     Student.find({}).exec(function(err,docs){
//         console.log(docs.length);
        // docs.forEach(function(doc){
        //     User.remove({'usn':doc.USN},function(err1,user){
        //         console.log("deleted user");
        //     })
        //     Student.remove({'USN':doc.USN},function(err2,stud){
        //         console.log("Del student")
        //     })
            // console.log(doc.selectedPlacements);
            // doc.remove();
            // doc.save();
            // delete doc.registeredStudents;
            // delete doc.selectedStudents;
            // delete doc.placedStudents;
            // doc.save();
        // });
        // res.send(doc);
//     });
// })



router.post("/register", function(req, res){
    
    adminController.signUp(req.body,function(addedUser){
        res.send("user Added");
    });
});
router.post("/login", function(req, res, next){
    adminController.Login(req,res,function(stat){
        // res.send();
        console.log(stat);
    });
});
router.post("/addStudent", middleware.isAdminOrPlacement, function(req, res){

    studentController.addStudent(req.body,function(addedStudent){
        res.redirect("/verify?authToken="+addedStudent.authToken);    
    });

    
});

router.get("/",function(req,res){          // the index page
    req.session.redirectTo=null;
    res.render("homePage2");
});

router.get("/addStudent", middleware.isAdminOrPlacement, function(req, res) {
    res.render("addStudent",{update:'none'});
}); 

router.get("/mails",function(req,res){
    var searchCondition={ semester: { $in: [7,8] } , department: { $in: ['CSE','ISE','ECE'] }};
    var selectArray = ['author.email'];
    var populate = '';
    studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
        console.log(mails);
        res.send(mails);    
    });
    // studentController.getEmailIDs(searchCondition,function(mails){
    //     console.log(mails);
    //     res.send(mails);    
    // });
});
router.get("/updateStudent/:id", middleware.isAdminOrPlacement, function(req,res){
    var populate = {
            path:'author',
            model:'User'
        };
    var selectArray=['department','semester'];
    studentController.findStudent(req.params.id,selectArray,populate,function(student){
        console.log(student);
        res.render("addStudent",{update:student});    
    });
});
// router.post("/addStudent", middleware.isAdminOrPlacement, function(req, res){
//     var usn = req.body.usn;
//     var newUser = new User({
//         email: req.body.email,
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         gender: req.body.gender,
//         usn: usn.toUpperCase(),
//         userType: "student"
//     });
//     User.register(newUser, 'amcec', function(err, user){
//         if(err){
//             console.log("error: ",err)
//             req.flash("error", "Email ID already exists!");
//             res.redirect("/addStudent");
//         }else{
//         var newStudent = new Student({
//             author: user._id,
//             semester: req.body.sem,
//             USN: usn.toUpperCase(),
//             department: req.body.department
//         })
//         Student.create(newStudent,function(err,student){
//             if(err){
//                 console.log(err);
//             }
//             else{
                
//                 var htmlMail = '<div> <p> Hello ADMIN, </p>'+
//                 '<p> This is a mail from GradBunker.  </p> <p> You added a new Student '+
//                 user.firstName+'. If you did not add the student, '+
//                 '<a href="'+homeurl+'/admin/delete/'+user._id+
//                 '">click here</a> to delete the user account</p>'+
//                 '<p> If not, Please ignore this mail</p><p> Regards, </p>'+
//                 '<p> GradBunker</p></div>';
                
//                 var studentHtmlMail = '<div> <p> Hello '+user.firstName+', </p>'+
//                 '<p> This is a mail from GradBunker.  </p><p> Welcome! You are registered on GradBunker.'+
//                 ' Kindly update your profile. </p>'+
//                 '<p> <a href="'+homeurl+'/student/updateProfile">Click here</a> to update your profile.</p><p> Regards, '+
//                 '</p><p> GradBunker</p></div>';
//                 var mailOptions = {
//                     from: 'GradBunker <keith@keithfranklin.xyz>', // sender address
//                     to: 'bkm.blore@gmail.com', // list of receivers
//                     subject: 'You recently added a Student', // Subject line
//                     html: htmlMail //, // plaintext body
//                 };
//                 var studentMailOptions = {
//                     from: 'GradBunker <keith@keithfranklin.xyz>', // sender address
//                     subject: 'Welcome to GradBunker', // Subject line
//                     to: user.email,
//                     html: studentHtmlMail //, // plaintext body
//                 };
                
//                 transporter.sendMail(mailOptions, function(error, info){
//                     if(error){
//                         console.log(error);
//                     }
//                     else{
//                         transporter.sendMail(studentMailOptions, function(error1, info1){
//                             if(error1){
//                                 console.log(error1);
//                             }
//                             else{
//                                 console.log('Message sent to student: congo!!!!!');
//                             };
//                         });
//                         console.log('Message sent: congo!!!!!');
//                         res.redirect("/verify?authToken="+user.authToken);
//                     };
//                 });
//             }
//         })
//         }
//     });
// });

// router.get("/updateStudent/:id", middleware.isAdminOrPlacement, function(req,res){ 
//     Student.findOne({'author':req.params.id}).populate({
//         path:'author',
//         model:'User'
//     }).exec(function(err,student){
//         res.render("addStudent",{update:student});    
//     });
    
// });

router.post('/updateStudent/:id',middleware.isAdminOrPlacement, function(req, res) {
    // res.send(req.body);
    var usn = req.body.usn;
    User.findOne({'_id':req.params.id},function(err,user){
        if(err) console.log("User update error: ",err);
        else{
            user.email= req.body.email,
            user.firstName= req.body.firstName,
            user.lastName= req.body.lastName,
            user.gender= req.body.gender,
            user.usn= usn.toUpperCase()
            user.save();
            Student.findOne({author:user._id},function(err2,student){
                if(err2) console.log("User student update error: ",err2);
                else{
                    student.semester= req.body.sem;
                    student.USN= usn.toUpperCase();
                    student.department= req.body.department;
                    student.save(function(err3){
                        if(err3) console.log("Update student error: ",err3);
                        else{
                            req.flash("success","Student edited");
                            res.redirect("/"+user.userType+"/students");
                        }
                    });
                }
            })
        }
    })
});

router.get('/verify', function(req, res) {
    var user = req.user;
    User.verifyEmail(req.query.authToken, function(err, existingAuthToken) {
        if(err) console.log('err:', err);
        else{
            req.flash('success', 'New User added and Verified');
            res.redirect("/");
        }
    });
});

router.get("/letter",function(req,res){   
    res.render("student/letter");
});

router.get("/email",function(req,res){  
    Placement.findOne({},function(err,placement){
        if(err) console.log(err);
        else{
            res.render("placement/email",{placement:placement});
        }
    })
});

router.get("/viewResults",function(req,res){
    var branch = 'Computer Science Engineering',department;
    var sem = 8;
    if(req.query.department){
        department = req.query.department;
        switch(req.query.department) {
            case 'CS':
                branch = 'Computer Science Engineering';
                break;
            case 'EC':
                branch = 'Electronics & Communication Engineering';
                break;
            case 'IS':
                branch = 'Information Science Engineering';
                break;
            case 'ME':
                branch = 'Mechanical Engineering';
                break;
            case 'EE':
                branch = 'Electrical & Electronics Engineering';
                break;
            case 'CE':
                branch = 'Civil Engineering';
                break;
            default:
                branch = '';
        }
        sem = req.query.sem;
    }else department = 'CS';
    
   VTUmarks.find({'department':department,'marks.sem':sem}).sort('-marks.total').exec(function(err,records){
       if(err){
           console.log("Error: ",err);
       }
       else{
        //   console.log(records);
           res.render("result/viewScrapedResults",{allResults: records,
           branch:branch,department:department,sem:sem})
       }
   }) 
});

router.post("/viewScrapedResults",function(req,res){
    res.redirect("/viewResults?sem="+req.body.sem+"&department="+req.body.department);
});

router.post("/viewResult",function(req,res){
    res.redirect("/viewResult/"+req.body.usn);
})

router.get("/viewResult/:id",function(req, res){
    var usn = req.params.id.toUpperCase();
    VTUmarks.findOne({'usn':usn},function(err,record){
        if(err){
            console.log("Error: ",err);
        }
        else{
            res.render("result/viewResult",{student: record})
        }
    }) 
})

router.get("/exportPDF/:id",function(req,res){
    // https://www.npmjs.com/package/wkhtmltopdf
    var usn = req.params.id.toUpperCase();
    VTUmarks.findOne({'usn':usn},function(err,record){
        if(err){
            console.log("Error: ",err);
        }
        else{
            ejs.renderFile(template,{student: record}, function(err1, html1){
                if (err1) console.log("Err1",err1);
                else{
                    conversion({ html: html1 }, function(err2, pdf) {
                        if(err1) console.log("Err2",err2)
                        console.log(pdf.numberOfPages);
                        pdf.stream.pipe(res);
                    });
                }
            })
        }
    })
})

router.get("/export/:id1/:id2",function(req,res){
    var studentRecords = [];
    var studentmarks=[{}];
    VTUmarks.find({'department':req.params.id1,'marks.sem':req.params.id2}).sort('usn').exec(function(err,students){
        if(err){
            console.log("Error: ",err);
        }
        else{
            studentRecords = students;
            studentRecords.forEach(function(student){
                var studUSN = student.usn;
                studentmarks[studUSN]={};
                student.marks[0].subjects.forEach(function(subject){
                    studentmarks[studUSN][subject.subjectCode]=subject;
                })
            })
            // console.log("Subject: ",studentmarks['1AM13CS088']['10CS82']['internalMarks']);
            // console.log("Found ",students);
        }
    })
    
    var workbook = new Excel.Workbook();
    workbook.xlsx.readFile('result.xlsx')
    .then(function() {
        var sem = 0;
        var worksheet = workbook.getWorksheet(1);
        var i = 4;
        var subjects1=['10IS81','10CS82','10CS835','10CS842','10CS845','10CS85','10CS86'];
        var subs2=[];
        studentRecords.forEach(function(student){
            var row = worksheet.getRow(i);
            var j = 9;
            
            var percentage = Math.round((student.marks[0].total / 7.5) * 100) / 100;
            sem = student.marks[0].sem;
            var stusn = student.usn;
            row.getCell(1).value = i - 3;
            row.getCell(2).value = student.usn;
            row.getCell(3).value = student.name;
            row.getCell(4).value = student.department;
            row.getCell(5).value = student.marks[0].sem;
            row.getCell(6).value = student.marks[0].total;
            row.getCell(7).value = percentage;
            row.getCell(8).value = student.marks[0].result;
            
            subjects1.forEach(function(subcode){
                // console.log("Subject: ",studentmarks[stusn][subcode]);
                if (studentmarks[stusn][subcode] === undefined) { j = j+4; return; }
                row.getCell(j).value = studentmarks[stusn][subcode].internalMarks;
                row.getCell(j + 1).value = studentmarks[stusn][subcode].externalMarks;
                row.getCell(j + 2).value = studentmarks[stusn][subcode].subTotal;
                row.getCell(j + 3).value = studentmarks[stusn][subcode].subResult;
               
                j = j+4;
            })
            row.commit();
            i= i + 1;
        })
        var tempFilePath = tempfile(sem+'.xlsx');
        workbook.xlsx.writeFile(tempFilePath).then(function() {
            console.log('file is written');
            res.sendFile(tempFilePath, function(err){
                if(err)
                    console.log('---------- error downloading file: ' + err);
                else{
                    console.log("File Downloaded");
                }
            });
        });
        // return workbook.xlsx.writeFile('new.xlsx');
    })
});


router.get('/userlist',function(req, res) {
    User.find({},function(err, users) {
        if(err){
            console.log(err);
        }else{
            res.send(users);
        }
    });
});

router.get("/:username/changePassword",function(req,res){
   res.render("change_pass"); 
});

router.get("/forgotPassword",function(req,res){
   res.render("forgotPass"); 
});

router.post("/forgotPassword",function(req,res){
   User.findOne({email:req.body.email},function(err,user){
       if(err){
           console.log(err);
       }else{
           if(!user){
               req.flash("error","User not registered!");
               res.redirect("/forgotPassword")
           }else{
            //   if(!/@gmail.com/.test(user.email))
                    // user.email="";
                console.log(user.email);
               var mailOptions;
               req.session.verCode=randomstring.generate();
               var htmlMail = '<div> <p> Hello '+user.firstName+', </p>'+
                '<p> This is a mail from GradBunker.  </p> <p> Copy the verification code is mentioned below: </p>'+
                '<p><b> '+req.session.verCode+ '</b></p><p> '+
                '<p> Or, <a href="'+homeurl+'/resetPassword/'+req.session.verCode+
                '">click here</a> to reset your password!</p>'+
                '<p> If you did not forget your password, Please ignore this mail</p><p> Regards, </p>'+
                '<p> GradBunker</p></div>';
                mailOptions = {
                    from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                    to: 'bkm.blore@gmail.com ,'+user.email, // list of receivers
                    subject: 'GradBunker-Verification Code', // Subject line
                    html: htmlMail
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        req.session.verMail=user.email;
                        console.log('Message sent: congo!!!!!');
                        req.flash("success","Verification Code sent to mail.")
                        res.render("verifyMail");
                        // callback(null,"It works");
                    };
                });
               
               
           }
       }
   })
});

router.post("/verifyEmail",function(req,res){
    if(req.body.code===req.session.verCode){
        req.flash("success","Email Verified")
        res.redirect("/resetPassword/"+req.session.verCode);
    }else{
        req.session.verCode=null;
        req.session.verMail=null;
        req.flash("error","Invalid Code! Please try again!");
        res.redirect("/forgotPassword");
    }
});

router.get('/resetPassword/:token', function(req, res) {
    if(req.params.token===req.session.verCode){
        res.render('resetPass',{token:req.params.token});
    } else {
        req.flash('popup', 'Invalid or Expired Link! Try again! Due to our authentication policy we dont recognize this device'
        +' please use the same device to reset password...');
        return res.redirect('/forgotPassword');
    }
});

router.post('/resetPassword/:token', function(req, res) {
    var newPassword= req.body.pass;
    var confirmNewPassword= req.body.pass1;
    User.findOne({email: req.session.verMail}, function(err, user) {
        if (err) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/forgotPassword');
        }
        else{
            if(newPassword===confirmNewPassword){
               user.setPassword(newPassword, function(error){
                   if(error){
                        console.log(error);
                   }
                   else{
                       user.save(function(err2){
                           if(err2){
                               console.log("Error in saving: "+err2);
                           }
                           else{
                               req.session.verCode=null;
                               req.session.verMail=null;
                               req.flash("success","Password reset successfully! Login to Continue");
                               res.redirect("/login");
                           }
                       }); 
                    }
                });
            } else {
                req.flash("error","Passwords do not match");
                res.redirect("/resetPass/"+req.session.verCode);
            }
        }
    });
});

// show register form
router.get("/register",function(req, res) {
    res.render("signup");
}); 


//handle sign up logic
// router.post("/register", function(req, res){
//     var newUser = new User({
//         email: req.body.email,
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         userType: "admin"
//     });
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             console.log("error: ",err)
//             req.flash("error", err.message);
//             return res.render("signup");
//         }
//         // if(!/@gmail.com/.test(user.email))
//             // user.email="";
//         var text = 'Hello '+user.firstName+
//                     ',\n This is a mail from GradBunker.\n '+
//                     ' Kindly click the following link to reset password!\n'+
//                     ' Link: '+homeurl+'/verify'+
//                     '?authToken=' + user.authToken+
//                     '\n If you did not register, please ignore this email';
//         var mailOptions = {
//             from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
//             to: user.email, // list of receivers
//             subject: 'Verify Your account', // Subject line
//             text: text //, // plaintext body
//         };
//         transporter.sendMail(mailOptions, function(error, info){
//             if(error){
//                 console.log(error);
//             }
//             else{
//                 console.log('Message sent: congo!!!!!');
//                 res.json({message: 'Verification Mail Sent'});
//                 // req.flash('success', 'Reset link sent to your mail!');
//         // res.json({yo: info.response});
//             };
//         });
//     });
// });


router.get("/placements",function(req, res) {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'-'+mm+'-'+yyyy;
    var tDate = today.split("-");
    Placement.find({})
    .populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).sort('student.department').exec(function(err,cpny){
        if(!err){
            Internship.find({})
            .populate({
                path: 'registeredStudents',
                model:'Student',
                populate: {
                  path: 'author',
                  model: 'User'
                }
            }).sort('student.department').exec(function(err2,internships){
                if(err2)console.log("Intern error: ",err2);
                else{
                    res.render('placement/placement_list',
                    {company:cpny,internships: internships, todaysDate: tDate})
                }
            })
        }
    });
    
});

router.get('/verify', function(req, res) {
    User.verifyEmail(req.query.authToken, function(err, existingAuthToken) {
        if(err) console.log('err:', err);
        else{
            res.json({message: 'User Verified'});;
        }
      });
});

//show login form
router.get("/login", function(req, res){
   res.render("login");
});

//handling login logic
// router.post("/login", function(req, res, next){
//     // console.log("got one!");
//     // console.log(req.body);
//     if(req.params.id=='test')
//         req.params.id='student';
//     passport.authenticate('local', function(err, user, info) {
//         if (err) { return next(err); }
//         req.logIn(user, function(err) {
//           if (err) { 
//               req.flash("error","Invalid Credentials");
//                 res.redirect('/login'); 
//             //   return next(err); 
//           }
//           else{
//             //   req.cookies.user=user.email;
//             //   console.log("Email: ",user.email);
//             //   console.log("cookie: ",req.cookie.user);
//           redirectTo = req.session.redirectTo ? req.session.redirectTo : '/' + user.userType;
//           delete req.session.returnTo;
//         //   console.log(redirectTo);
//           return res.redirect(redirectTo);
//           }
//         });
        
        
//     })(req, res, next);
// });



router.get("/changePassword",function(req,res){
    res.render("changePass"); 
})

router.post("/changePassword",middleware.isLoggedIn,function(req,res){
   var newPassword= req.body.pass;
   var confirmNewPassword= req.body.pass1;
   User.findOne({email: req.user.email},function(error,user){
       if(error){
           console.log(Error);
       }
       else{
          if(newPassword===confirmNewPassword){
               user.setPassword(newPassword, function(error){
                   if(error){
                        console.log(error);
                   }
                   else{
                       user.save(function(err){
                           if(err){
                               console.log("Error in saving: "+err);
                           }
                           else{
                               req.flash("success","Password changed successfully");
                               res.redirect("/"+req.user.userType);
                           }
                       }); 
                   }
                });
            } else {
                req.flash("error","Passwords do not match");
                res.redirect("/changePassword");
            }
       }
   
});
});


// logout route
router.get("/logout",middleware.isLoggedIn, function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
//   redirectTo = req.session.redirectTo ? req.session.redirectTo : '/' + req.params.id;
//   delete req.session.returnTo;
   res.redirect("/");
});

router.get("/leaderboard",function(req,res){
    res.render("tests/leaderboard");
});


router.get("/listOfdrives/:id",function(req, res) {
    switch(req.params.id){
        case 'home':
            Placement.find({}).sort({'_id':-1}).limit(2).exec(function(err,cpny){
                res.send(cpny);
            });
            break;
        case 'list':
            Placement.find({}).exec(function(err,cpny){
                res.send(cpny);
            });
            break;
    }
    
    
});

module.exports = router;