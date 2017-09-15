var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var Placement = require("../models/placement");
var Student = require("../models/student");
var LeaderBoard = require("../models/leaderboard");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var mkdirp = require('mkdirp');
var ejs = require('ejs');
var smtpTransport = require('nodemailer-smtp-transport');
var multer = require('multer');
var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } )
var S3FS = require('s3fs'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
    
var resultAnalysis = require("./externalFunction/placementTestAnalysis");
router.use(multipartyMiddleware);


router.get("/",function(req,res){
    Student.findOne({'author':req.user._id}).populate('author').exec(function(err,student){
        if(err) console.log(err);
        else{
            res.render("student/viewProfile",{student: student});
            // res.send(student);
        }
    })
});
router.get("/mobile/:id",function(req,res){
    Student.findOne({'author':req.params.id}).populate('author').exec(function(err,student){
        if(err) console.log(err);
        else{
            res.send(student);
            // res.send(student);
        }
    })
});





// 
router.get("/registerPlacement/:id",function(req,res){
    var currentUser = req.user;
    if(currentUser){
        if(currentUser.userType==="student"){
            f1();
        }else{
            req.flash("error","Sorry! You are not a student!");
            res.redirect("/"+currentUser.userType);
        }
    }
    else{
        Placement.findOne({'_id':req.params.id},function(err,record){
            if(err) console.log(err);
            else{
                req.flash("success","Alert! You must be a student to do this!")
                res.render("student/registerPlacement",{record: record}); 
            }
        })    
    }
    
    function f1(){
        Placement.findOne({'_id':req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            Student.findOne({'author':currentUser._id},function(err1,student) {
                if(err1) console.log(err1);
                else{
                    record.registeredStudents.push(student.USN);
                    record.save();
                    student.registeredPlacements.push(record._id);
                    student.save();
                    console.log("Successful registration")
                    req.flash("success","You are successfully registered!");
                    res.redirect("/student");
                }
            })
        }
    })
    }
});

router.post("/registerPlacement/:id",function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            else{
                // req.flash("success","You are successfully registered!");
                res.redirect("/student/registerPlacement/"+req.params.id);
            }
        });
    })(req, res, next);
});

router.get("/updateProfile",function(req,res){
    var currentUser = req.user;
    Student.findOne({'author':currentUser._id}).populate('author').exec(function(err,student){
        if(err) console.log(err);
        else{
            res.render("student/updateProfile",{student: student});
        }
    })
});

router.post("/updateProfile1",function(req,res){
    
    var tenthpathToStore;
    if(req.files){
    if(req.files.tenthCard.originalFilename!==undefined){
        var tenthReport = req.files.tenthCard,
            fileExtension1 = tenthReport.name.split(".");
        console.log("file:",tenthReport.path)
        var fileExtension = fileExtension1[fileExtension1.length - 1]
        var filename = 'tenth.'+fileExtension;
        var filepath = "./public/uploads/students/"+req.body.usn+"/"+filename;
        tenthpathToStore = "/uploads/students/"+req.body.usn+"/"+filename;
        var stream = fs.createReadStream(tenthReport.path);
        var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'studentUploads/'+req.body.usn+'/'+filename,
            Body: stream
        };
        s3.upload(params, function(err, data) {
          if(err) console.log(err);
          else{
              console.log("URL: ",data.Location);
              res.send(data.Location);
          }
        });
    }
    }
});

router.post("/updateProfile",function(req,res){
    var allcount = 0;
    // var s3fsImpl = new S3FS('gradbunker/studentUploads/'+req.body.usn, {
    //     accessKeyId: "AKIAJV56NPSGEK3THCZQ",
    //     secretAccessKey: "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",
    //     region: "ap-south-1"
    // });
    var totalLen = Object.keys(req.files).length;
    // console.log("Total files count : ",totalLen);
    var semResultUploads = [], tenthpathToStore, twelfthpathToStore;
    var certificationUploads = [];
    var resumePathToStore;
    Student.findOne({'USN':req.body.usn},function(err,student){
        if(err) console.log(err);
        else{
            semResultUploads = student.semResults;
            certificationUploads = student.certifications;
            tenthpathToStore = student.tenthResult.reportLink;
            twelfthpathToStore = student.twelfthResult.reportLink;
            resumePathToStore = student.resumeLink;
        }
    })
    // console.log("Tenth: ",req.files.tenthCard);
    function f1(totalLen){
    
    if(req.files){
    if(req.files.tenthCard.originalFilename!==''){
        var tenthReport = req.files.tenthCard,
            fileExtension1 = tenthReport.name.split(".");
        var fileExtension = fileExtension1[fileExtension1.length - 1]
        var filename = 'tenth.'+fileExtension;
        var stream = fs.createReadStream(tenthReport.path);
        var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'studentUploads/'+req.body.usn+'/'+filename,
            Body: stream
        };
        s3.upload(params, function(err, data) {
          if(err) console.log(err);
          else{
            tenthpathToStore = data.Location;
            allcount = allcount + 1;
            // console.log("All count 1: ",allcount);
            if(allcount===totalLen)
                f2();
          }
        });
    }else{
        allcount = allcount + 1;
        // console.log("All count 1: ",allcount);
        if(allcount===totalLen)
            f2();
    }
    if(req.files.twelfthCard.originalFilename!==''){
        var twelfthReport = req.files.twelfthCard,
            fileExtension1 = twelfthReport.name.split(".");
        var fileExtension = fileExtension1[fileExtension1.length - 1]
        var filename1 = 'twelfth.'+fileExtension;
        stream = fs.createReadStream(twelfthReport.path);
        params = {ACL: "public-read", Bucket: 'gradbunker', 
            Key: 'studentUploads/'+req.body.usn+'/'+filename1, Body: stream
        };
        s3.upload(params, function(err, data1) {
          if(err) console.log(err);
          else{
            twelfthpathToStore = data1.Location;
            allcount = allcount + 1;
            // console.log("All count 2: ",allcount);
            if(allcount===totalLen)
                f2();
          }
        });
    }else{
        allcount = allcount + 1;
        // console.log("All count 2: ",allcount);
        if(allcount===totalLen)
            f2();
    }
    if(req.files.semCard1.originalFilename!==''){
        semResultUploads = [];
        var body=req.files;
        var properties = [];
        var i = 1;
        for(var prop in body) {
            var text = "semCard"+i;
            if((prop===text)&&(req.files[prop].originalFilename!=='')){
                properties.push(prop);
                i= i + 1;
                // console.log("Sems: ",properties);
            }else if(prop===text){
                allcount = allcount + 1;
                // console.log("All count 3: ",allcount);
                if(allcount===totalLen)
                    f2();
            }
        }
        var j = 0;
        var semReport = [],filename2=[];
        properties.forEach(function(prop){
            // console.log("SemLength: ",properties.length);
            j = j + 1;
            semReport[j] = req.files[prop];
            fileExtension1 = semReport[j].name.split(".");
            var fileExtension = fileExtension1[fileExtension1.length - 1]
            filename2[j] = 'sem'+j+'.'+fileExtension;
        })
        // var count = 1;
        uploader(1);
        function uploader(ct){
            if(ct<=properties.length){
                allcount = allcount + 1;
                console.log("All count 4: ",allcount);
                // console.log("Count: ",ct)
                var stream = fs.createReadStream(req.files[properties[ct - 1]].path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', 
                    Key: 'studentUploads/'+req.body.usn+'/'+filename2[ct], Body: stream
                };
                s3.upload(params, function(err, data2) {
                    if(err) console.log(err);
                    else{
                        var BEuploads = {
                            sem: req.body['sem'+ ct], 
                            Percentage: req.body['semPercentage'+ ct], 
                            reportLink: data2.Location
                        }
                        semResultUploads.push(BEuploads);
                    }
                    ct = ct + 1;
                    uploader(ct);
                });
            }else{
                if(allcount===totalLen)
                    f2();
            }
        }
    }else{
        allcount = allcount + 7;
        // console.log("All count 4: ",allcount);
        if(allcount===totalLen)
            f2();
    }
    if(req.files.title1Card.originalFilename!==''){
        certificationUploads = [];
        var body1=req.files;
        var properties1 = [];
        var l = 1;
        var text = '';
        for(var prop in body1) {
            text = "title"+l+"Card";
            if((prop===text)&&(req.files[prop].originalFilename!=='')){
                properties1.push(prop);
                l= l + 1;
                // console.log("Certs: ",properties1);
            }else if(prop===text){
                allcount = allcount + 1;
                // console.log("All count 5: ",allcount);
                if(allcount===totalLen)
                    f2();
            }
        }
        var m = 0;
        var certificateReport = [], filename3 = [];
        properties1.forEach(function(prop){
            // console.log("cert Length: ",properties1.length);
            m = m + 1;
            certificateReport[m] = req.files[prop],
                fileExtension1 = certificateReport[m].name.split(".");
            var fileExtension = fileExtension1[fileExtension1.length - 1]
            filename3[m] = 'certificate'+m+'.'+fileExtension;
        })
        uploader1(1);
        function uploader1(count){
            if(count<=properties1.length){
                allcount = allcount + 1;
                console.log("All count 6: ",allcount);
                var stream = fs.createReadStream(req.files[properties1[count - 1]].path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', 
                    Key: 'studentUploads/'+req.body.usn+'/'+filename3[count], Body: stream
                };
                s3.upload(params, function(err, data3) {
                    if(err) console.log(err);
                    else{
                        var BEcertuploads = {
                            description: req.body['title'+count], 
                            docLink: data3.Location
                        }
                        certificationUploads.push(BEcertuploads);
                    }
                    count = count + 1;
                    uploader1(count);
                });
            }else{
                if(allcount===totalLen)
                    f2();
            }
        }
    }else{
        allcount = allcount + 1;
        // console.log("All count 6: ",allcount);
        if(allcount===totalLen)
            f2();
    }
    if(req.files.resume.originalFilename!==''){
        var resume = req.files.resume,
            fileExtension1 = resume.name.split(".");
        var fileExtension = fileExtension1[fileExtension1.length - 1]
        var filename4 = 'resume.'+fileExtension;
        stream = fs.createReadStream(resume.path);
        params = {ACL: "public-read", Bucket: 'gradbunker', 
            Key: 'studentUploads/'+req.body.usn+'/'+filename4, Body: stream
        };
        s3.upload(params, function(err, data4) {
          if(err) console.log(err);
          else{
            allcount = allcount + 1;
            // console.log("All count 7: ",allcount);
            resumePathToStore = data4.Location;
            if(allcount===totalLen)
                f2();
          }
        });
        
    }else{
        allcount = allcount + 1;
        // console.log("All count 7: ",allcount);
        if(allcount===totalLen)
            f2();
    }
    }
    else{
        console.log("error file")
    }
    }
    function f2(){
    Student.findOne({'author':req.user._id},function(err,student){
        if(err) console.log(err);
        else{
            student.gender= req.body.gender;
            student.department = req.body.department;
            student.placements= req.body.placementNumber;
            student.DOB= req.body.dob;
            student.mobile1= req.body.phone;
            student.address= req.body.address;
            student.tenthResult= { board: req.body.tenthBoard, Percentage: req.body.tenthPercentage, 
                        yearPassed: req.body.tenthPassYear, reportLink: tenthpathToStore};
            student.twelfthResult= { board: req.body.twelfthBoard, Percentage: req.body.twelfthPercentage, 
                        yearPassed: req.body.twelfthPassYear, reportLink: twelfthpathToStore};
            student.semResults= semResultUploads;
            student.semAggregate= req.body.sem1Percentage;
            student.resumeLink= resumePathToStore;
            student.certifications= certificationUploads;
            student.save(function(err1,studentInfo){
                if(err1){
                    console.log("Error: ",err1)
                    req.flash("success","Student profile not updated");
                    res.redirect("/");
                } 
                else{
                    console.log("Student Profile Updated ");
                    req.flash("success","Profile Updated");
                    res.redirect("/student/viewProfile");
                }
            })
        }
    })
    }
    // f1(setTimeout(f2, 15000));
    f1(totalLen);
});

router.get("/viewProfile",middleware.isLoggedIn, function(req,res){
    req.session.redirectTo = '/student/viewProfile';
    Student.findOne({'author':req.user._id}).populate('author').exec(function(err,student){
        if(err) console.log(err);
        else{
            res.render("student/viewProfile",{student: student});
            // res.send(student);
        }
    })
});

router.post("/updateDP",function(req,res){
    var profilePic = "/images/"+req.body.dp;
    User.update({'email':req.user.email},{$set:{"dp":profilePic}},function(err,doc){
        if(err){
            console.log("Update err");
        }
        else{
            res.redirect("/student")
        }
    });
})

router.get('/verifyUpdate', function(req, res) {
    Student.findOne({'_id':req.query.userinfo}, function(err, student) {
        if(err) console.log('err:', err);
        else{
            User.findOne({'_id':student.author},function(err1, user) {
                if(err) console.log('err:', err1);
                else{
                    req.logIn(user, function(err2){
                        if(err) console.log('err:', err2);
                        else{
                            res.redirect('/student/updateProfile');
                        }
                    });
                }
            })
        }
    });
});

router.get('/viewFile', function(req, res) {
    res.render("student/viewFile",{link:req.query.link});;
});


router.get('/testAnalysis',middleware.isLoggedIn,function(req, res) {
    Student.findOne({'author':req.user._id},function(err, student) {
        if(err)
            console.log(err);
        res.render('student/PlacementAnalysis',{testResult:student.PlacementTestResults});    
    });
});

router.get('/getAnalysis',function(req,res){
    Student.findOne({'author':req.user._id},function(err, student) {
        if(err)
            console.log(err);
            // console.log(student.PlacementTestResults[student.PlacementTestResults.length - 1][0]);
        resultAnalysis(req,student.PlacementTestResults[student.PlacementTestResults.length-1][0],res);
    });
});


module.exports = router;














// router.get("/applyLeave",function(req,res){
//     res.render("student/applyLeave");
// });

// router.post("/applyLeave",function(req,res){
//     var usn1,department,sem;
//     Student.findOne({'author':req.user._id},function(err,student){
//         if(err) console.log(err);
//         else{
//             usn1= student.USN;
//             department = student.department;
//             sem = student.semester;
//         }
//     });
//     const template = './views/student/letter.ejs';
//     var today = new Date();
//     var dd = today.getDate();
//     var mm = today.getMonth()+1; //January is 0!
//     var yyyy = today.getFullYear();
//     if(dd<10){
//         dd='0'+dd;
//     } 
//     if(mm<10){
//         mm='0'+mm;
//     } 
//     var today = dd+'-'+mm+'-'+yyyy;
//     var mailAttachments = [];
//     var length = req.files.images.length;
//     var count = 1;
//     function f1(){
//         if(length>0){
//             function uploader(i){
//                 var imageFile = req.files.images[i],
//                     fileExtension1 = imageFile.name.split(".");
//                 var fileExtension = fileExtension1[fileExtension1.length - 1]
//                 var filename = Date.now()+'image'+i+'.'+fileExtension;
//                 var stream = fs.createReadStream(imageFile.path);
//                 var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'LetterUploads/'+filename,
//                     Body: stream
//                 };
//                 s3.upload(params, function(err, data) {
//                     if(err) console.log(err);
//                     else{
//                         var newAttachment = {
//                             filename: filename,
//                             path: data.Location
//                         }
//                         mailAttachments.push(newAttachment);
//                         if(count===length) f2();
//                         else{
//                             count = count + 1;
//                             i = i + 1;
//                             uploader(i);
//                         }
//                   }
//                 });
//             }
//             uploader(0);
//         }else{
//             f2();
//         }
//     }
//     function f2(){
//         var newLetter = {
//             name: req.user.firstName+' '+req.user.lastName,
//             date: today,
//             usn: usn1,
//             sem: sem,
//             department: department,
//             subject: req.body.subject,
//             body: req.body.letterBody,
//         };
//         var mailOptions;
//         var transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             host: "smtp.gmail.com",
//             auth: {
//                 user: 'bkm.blore.c9@gmail.com', // Your email id
//                 pass: 'cloudnine' // Your password
//             }
//         });
//         // console.log("Attachments: ",mailAttachments);
//         ejs.renderFile(template,{student: newLetter}, function(err, html){
//             if (err) console.log(err);
//             else{
//                 mailOptions = {
//                     from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
//                     to: 'bkm.blore@gmail.com, '+req.user.email, // list of receivers
//                     subject: 'Applied for Leave', // Subject line
//                     html: html, //, // plaintext body
//                     attachments: mailAttachments
//                 };
//             }
//         });
        
//         transporter.sendMail(mailOptions, function(error, info){
//             if(error){
//                 console.log(error);
//             }
//             else{
//                 console.log('Message sent: congo!!!!!');
//                 req.flash("success","Leave Letter sent! Check email!");
//                 res.redirect("/student");
//             };
//         });
           
//     }
//     f1();
// });
