var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
var LeaderBoard = require("../models/leaderboard");
var Student = require("../models/student");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var ejs = require('ejs');
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');

var mkdirp = require('mkdirp');
var aSync = require('async');
var testAnalysisHead = require("./externalFunction/testAnalysisHead");
// var transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     host: "smtp.gmail.com",
//     auth: {
//         user: 'bkm.blore.c9@gmail.com', // Your email id
//         pass: 'cloudnine' // Your password
//     }
// });

// ===================================================
//  mohan i want this to work 

// var transporter = nodemailer.createTransport(smtpTransport({
//     service: 'SES',
//     host: 'email-smtp.us-east-1.amazonaws.com',
//     port: 465,
//     secure: true, // use TLS
//     auth: {
//         user: 'AKIAISE5QC37XX62ICTQ',
//         pass: 'Ag3M8NPX1XlMInn7WVqMM02LCyTCfN5gaF6XxLYKE7b3'
//     }
// }));

var transporter = nodemailer.createTransport(ses({
    accessKeyId: 'AKIAIBR46HUWC6DXQKCQ',
    secretAccessKey: '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'
}));



var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } )
var S3FS = require('s3fs'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
router.use(multipartyMiddleware);
const template = './views/placement/email.ejs';
const internshipTemplate = './views/placement/internEmail.ejs';

router.get("/",function(req,res){
    var lengths_users,lengths_students,length_placementHeads=0;
    User.find({}, function (err, users) {
        lengths_users = users.length;
        users.forEach(function(val,index){
            if(val.userType == 'placementHead')
                length_placementHeads++;    
        });
        
        Student.find({}, function (err, studs) {
            lengths_students = studs.length;
            length ={
                user : lengths_users,
                student: lengths_students,
                placement: length_placementHeads
            };
            res.render("placement/home",{lengths:length});
        }); 
    });
    
    
});
router.get('/student_list',middleware.isPlacementHead,function(req, res) {
    Student.find({}).populate({
        path: 'author',
        model: 'User'
    }).exec(function(err,studs){
        res.render('placement/student_list',{list:studs});        
    });
});

router.post('/students/delete',middleware.isPlacementHead, function(req, res, next) {
    var usn = req.body.USN || req.query.USN;
    var userID = req.body.userID || req.query.userID;
    Student.remove({'USN':usn }, function(err, user) {
        if (err) { 
            res.json({"error": err});
        } else { 
            User.remove({'_id':userID }, function(err, user) {
                if (err) { 
                    res.json({"error": err});
                } else { 
                    res.json({success: true});
                    req.flash("success","User removed");
                }
            })
       }
   });
});

router.get("/addStudent", middleware.isAdminOrPlacement, function(req, res) {
    res.render("placement/addStudent");
}); 


//handle sign up logic
router.post("/addStudent", middleware.isPlacementHead, function(req, res){
    var usn = req.body.usn;
    var newUser = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        usn: usn.toUpperCase(),
        userType: "student"
    });
    User.register(newUser, 'amcec', function(err, user){
        if(err){
            console.log("error: ",err)
            req.flash("error", err.message);
            return res.render("placement/addStudent");
        }
        var newStudent = new Student({
            author: user._id,
            semester: req.body.sem,
            USN: usn.toUpperCase()
        })
        Student.create(newStudent,function(err,student){
            if(err){
                console.log(err);
            }
            else{
                
                var htmlMail = '<div> <p> Hello ADMIN, </p>'+
                '<p> This is a mail from GradBunker.  </p> <p> You added a new Student '+
                user.firstName+'. If you did not add the student, '+
                '<a href="https://erpdontdelete-mkb95.c9users.io/admin/delete/'+user._id+
                '">click here</a> to delete the user account</p>'+
                '<p> If not, Please ignore this mail</p><p> Regards, </p>'+
                '<p> GradBunker</p></div>';
                
                var studentHtmlMail = '<div> <p> Hello '+user.firstName+', </p>'+
                '<p> This is a mail from GradBunker.  </p><p> Welcome! You are registered on GradBunker.'+
                ' Kindly update your profile. </p>'+
                '<p> <a href="https://erpdontdelete-mkb95.c9users.io/student/verifyUpdate?userinfo='+
                student._id+'">Click here</a> to update your profile.</p><p> Regards, '+
                '</p><p> GradBunker</p></div>';
                var mailOptions = {
                    from: 'GradBunker <keith@keithfranklin.xyz>', // sender address
                    to: 'bkm.blore@gmail.com', // list of receivers
                    subject: 'You recently added a Student', // Subject line
                    html: htmlMail //, // plaintext body
                };
                var studentMailOptions = {
                    from: 'GradBunker <keith@keithfranklin.xyz>', // sender address
                    to: 'bkm.blore@gmail.com, '+user.email, // list of receivers
                    subject: 'Welcome to GradBunker', // Subject line
                    html: studentHtmlMail //, // plaintext body
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        transporter.sendMail(studentMailOptions, function(error1, info1){
                            if(error1){
                                console.log(error1);
                            }
                            else{
                                console.log('Message sent to student: congo!!!!!');
                            };
                        });
                        console.log('Message sent: congo!!!!!');
                        res.redirect("/admin/verify?authToken="+user.authToken)
                    };
                });
            }
        })
    });
});




router.get("/addNewPlacement",function(req,res){
    res.render("placement/addNewPlacement");
});

router.post("/addNewPlacement",function(req,res){
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var qualification = req.body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    var emails,students;
    Student.find({}).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                emails = emails + ', '+ record.author.email;
            })
        }
    })
    var mailAttachments = [];
    var length = req.files.docs.length;
    var urls=[],count = 1;
    function f1(){
        if(length>0){
            function uploader(i){
                var imageFile = req.files.docs[i],
                    fileExtension1 = imageFile.name.split(".");
                var fileExtension = fileExtension1[fileExtension1.length - 1]
                var filename = Date.now()+'image'+i+'.'+fileExtension;
                var stream = fs.createReadStream(imageFile.path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'PlacementUploads/'+filename,
                    Body: stream
                };
                s3.upload(params, function(err, data) {
                    if(err) console.log(err);
                    else{
                        var newAttachment = {
                            filename: filename,
                            path: data.Location
                        }
                        mailAttachments.push(newAttachment);
                        urls.push(data.Location);
                        if(count===length) f2();
                        else{
                            count = count + 1;
                            i = i + 1;
                            uploader(i);
                        }
                  }
                });
            }
            uploader(0);
        }else{
            f2();
        }
    }
    function f2(){
    var newPlacement = new Placement({
        author: req.user._id,
        cName: req.body.cName,
    	Package: req.body.package,
    	jobLocation: req.body.jobLocation,
    	qualification: qualification,
    	department: department,
    	skills: req.body.skills,
    	designation: req.body.designation,
    	driveLocation: req.body.driveLocation,
    	date: req.body.driveDate,
    	eligibility: eligibility,
    	jobDescription: req.body.jobDescription, 
    	doc_links: urls,
    });
    Placement.create(newPlacement,function(error,newDrive){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update New Drive");
            res.redirect("/placementHead/addNewPlacement");
        }
        else{
            var html;
            // console.log("Created: ",newDrive);
            // req.flash("success","Updated New Drive");
            // res.redirect("/placementHead");
            var mailOptions;
            // console.log("Attachments: ",mailAttachments);
            ejs.renderFile(template,{placement: newDrive}, function(err, html){
                if (err) console.log(err);
                else{
                    mailOptions = {
                        from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                        to: 'bkm.blore@gmail.com '+emails, // list of receivers
                        subject: newDrive.cName+'- New Placement Update', // Subject line
                        html: html, //, // plaintext body
                        attachments: mailAttachments
                    };
                }
            });
            
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }
                else{
                    console.log('Message sent: congo!!!!!');
                    req.flash("success","Updated Placement Info");
                    res.redirect("/placementHead/list");
                    // callback(null,"It works");
                };
            });
        }
    })
    };
    f1();
});


router.get("/addNewInternship",function(req,res){
    res.render("placement/addNewInternship");
});

router.post("/addNewInternship",function(req,res){
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var qualification = req.body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    var emails,students;
    Student.find({}).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                emails = emails + ', '+ record.author.email;
            })
        }
    })
    var mailAttachments = [];
    var length = req.files.docs.length;
    var urls=[],count = 1;
    function f1(){
        if(length>0){
            function uploader(i){
                var imageFile = req.files.docs[i],
                    fileExtension1 = imageFile.name.split(".");
                var fileExtension = fileExtension1[fileExtension1.length - 1]
                var filename = Date.now()+'image'+i+'.'+fileExtension;
                var stream = fs.createReadStream(imageFile.path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'InternshipUploads/'+filename,
                    Body: stream
                };
                s3.upload(params, function(err, data) {
                    if(err) console.log(err);
                    else{
                        var newAttachment = {
                            filename: filename,
                            path: data.Location
                        }
                        mailAttachments.push(newAttachment);
                        urls.push(data.Location);
                        if(count===length) f2();
                        else{
                            count = count + 1;
                            i = i + 1;
                            uploader(i);
                        }
                  }
                });
            }
            uploader(0);
        }else{
            f2();
        }
    }
    function f2(){
    var newInternship = new Internship({
        author: req.user._id,
        cName: req.body.cName,
    	Package: req.body.package,
    	internLocation: req.body.internLocation,
    	duration: req.body.duration,
    	qualification: qualification,
    	department: department,
    	skills: req.body.skills,
    	designation: req.body.designation,
    	interviewLocation: req.body.interviewLocation,
    	lastDate: req.body.lastDate,
    	eligibility: eligibility,
    	internDescription: req.body.internDescription, 
    	doc_links: urls,
    });

    Internship.create(newInternship,function(error,newIntern){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update New Internship Details!");
            res.redirect("/placementHead/addNewInternship");
        }
        else{
            var html;
            // console.log("Created: ",newDrive);
            // req.flash("success","Updated New Drive");
            // res.redirect("/placementHead");
            var mailOptions;
            // console.log("Attachments: ",mailAttachments);
            ejs.renderFile(internshipTemplate,{internship: newIntern}, function(err, html){
                if (err) console.log(err);
                else{
                    mailOptions = {
                        from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                        to: 'bkm.blore@gmail.com ', // list of receivers
                        subject: newIntern.cName+'- New Internship Update', // Subject line
                        html: html, //, // plaintext body
                        attachments: mailAttachments
                    };
                }
            });
            
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }
                else{
                    console.log('Message sent: congo!!!!!');
                    req.flash("success","Updated Internship Info");
                    res.redirect("/placementHead/list");
                    // callback(null,"It works");
                };
            });
        }
    })
    };
    f1();
});




router.post('/addNewPlacementMobile',function(req, res) {
    var newPlacement1 = new Placement({
        cName: req.body.cName,
    	Package: req.body.Package,
    	jobLocation: req.body.jobLocation,
    	qualification: req.body.qualification,
    	department: req.body.department,
    	skills: req.body.skills,
    	designation: req.body.designation,
    	driveLocation: req.body.driveLocation,
    	date: req.body.date,
    	time: req.body.time,
    	eligibility: req.body.eligibility,
    	jobDescription: req.body.jobDescription, 
    	tenth: req.body.tenth,
	    twelve: req.body.twelve,
	    engineering: req.body.engg,
    	CIVIL: req.body.CIVIL,
        CS: req.body.CS,
        EC: req.body.EC,
        EEE: req.body.EEE,
        IS: req.body.IS,
        MCA: req.body.MCA,
        Mech: req.body.Mech
    });
    // console.log(newPlacement1);
    // console.log(req.body);
    
    Placement.create(newPlacement1,function(error,newDrive){
        if(error){
            res.send("no");
        }
        console.log(newDrive);
        res.send('yes');
    });
    
});

router.get("/list",function(req, res) {
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
    Placement.find({},function(err,cpny){
        if(!err){
            Internship.find({},function(err2,internships){
                if(!err2){
                    res.render('placement/viewPlacements',{company:cpny,internships: internships, todaysDate: tDate});
                }
            })
        }
    });
    
});

router.get("/viewRegisteredStudents/:id",function(req,res){
    Placement.findOne({'_id':req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            Student.find({'USN': { $in: record.registeredStudents}})
            .populate('author').exec(function(err1,docs){
                if(err1) console.log(err1);
                else{
                    res.render("placement/viewRegisteredStudents",{students: docs,company:record})    
                }
            })
        }
    })
})

router.get("/updatePlacementStats/:id",function(req,res){
    Placement.findOne({'_id':req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            Student.find({'USN': { $in: record.registeredStudents}})
            .populate('author').exec(function(err1,docs){
                if(err1) console.log(err1);
                else{
                    res.render("placement/updatePlacedStudents",{students: docs,company:record})    
                }
            })
        }
    })
})

router.post("/updatePlacementStats/:id",function(req,res){
    var placed = null,listOfPlacedStudents=[];
    Placement.findOne({'_id':req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            for(var i=0;i<=req.body.noOfStudents;i++){
                placed = 'placed' + i;
                if(i<req.body.noOfStudents){
                    if(req.body[placed]!=='no'){
                        listOfPlacedStudents.push(req.body[placed]);
                    }
                }else{
                    
                    record.placedStudents = listOfPlacedStudents;
                    record.save();
                    Student.find({'USN': { $in: record.placedStudents}})
                    .populate('author').exec(function(err1,docs){
                        if(err1) console.log(err1);
                        else{
                            res.render("placement/viewPlacedStudents",{students: docs,company:record})    
                        }
                    })
                }
            }
        }
    })
})

router.get("/sendReminder",function(req,res){
    res.render("placement/sendReminder");
});

router.post("/sendReminder",function(req,res){
    var StudentIDs ='bkm.blore@gmail.com';
    StudentIDs +=',keith30895@gmail.com,mkb.viru4@gmail.com';
    var update=req.body.reminder;
        
    Student.find({ $or: [ {'semester':8}, {'semester':7}]})
    .populate('author').exec(function (err, students) {
        if(err){
             req.flash('error',"No matching Records found to send mail!")
        } 
        else{
            // students.forEach(function(student){
            //     StudentIDs = StudentIDs+', '+student.author.email;
            //     console.log("Mails: ",StudentIDs);
            // });
            var mailOptions = {
                from: 'AMC Engineering College <keith@keithfranklin.xyz>', // sender address
                to: StudentIDs, // list of receivers
                subject: "Hey you've got some news from the Placement Officer!", // Subject line
                text: update //, // plaintext body
                // html: ejs.render(template,{pl: placementInfo})
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }
                else{
            
                       console.log('email sent: congo!!!!!');
                    req.flash("success","Update sent");
                    res.redirect("/placementHead");
                }
            });
        }
    });
});

router.get('/view',function(req, res) {
    Placement.find({},function(err,cpny){
        res.send(cpny);
    });
});
router.get('/viewStats',function(req,res){
    res.render('placement/viewStats');
});
router.get('/getAnalysis',function(req,res){
    LeaderBoard.find({}).sort({'_id':-1}).limit(1).exec(function(err,br){
        Student.findOne({'author': br[0].entry[0].author},function(err,student){
            testAnalysisHead(req,student.PlacementTestResults[student.PlacementTestResults.length - 1][0],res);
        });
    });
});





module.exports = router;