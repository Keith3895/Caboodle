var express = require("express");
var router  = express.Router();
var ejs = require('ejs');
var VTUmarks = require("../models/vtuMarks");
var middleware = require("../middleware");
var cheerio = require('cheerio');
var request = require('request');
var Excel = require('exceljs');
const tempfile = require('tempfile');
var fs = require('fs');
var pdf = require('html-pdf');
var conversion = require("phantom-html-to-pdf")();
const template = './views/result/resultPdf.ejs';
var randomstring = require("randomstring");
require('dotenv').config();


var adminController = require('../lib/controller/admin');
var authController = require('../lib/controller/auth');
var studentController = require('../lib/controller/student');
var placementController = require('../lib/controller/placement');
var funcs = require('../lib/CustomFunctions/functions');

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


router.get("/mails",function(req,res){
    var searchCondition={ semester: { $in: [8] } , department: { $in: 'CSE' }};
    var selectArray = ['author'];
    var populate = {
        path:'author',
        model:'User',
        select:{'email':1},
        match:{college:'amcec'}
    };
    studentController.getEmailIDs(searchCondition,selectArray,populate,function(mails){
        console.log(mails);
        res.send(mails);    
    });
});


router.post("/register", function(req, res){    
    adminController.signUp(req.body,function(addedUser){
        res.send("user Added");
    });
});
router.post("/login", function(req, res, next){
    authController.Login(req,res,function(stat){
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
router.post('/updateStudent/:id',middleware.isAdminOrPlacement, function(req, res) {
    studentController.UpdateStudent(req.params.id,req.body,function(updatedStudent){
        res.redirect('/'+req.user.userType);
    });
});


router.get('/verify', function(req, res) {
    authController.verifyEmail(req.query.authToken,function(stat){
        if(stat==='success'){
            req.flash('success','New User Added');
            res.redirect('/');
        }
    });
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

router.get("/:username/changePassword",function(req,res){
   res.render("change_pass"); 
});

router.get("/forgotPassword",function(req,res){
   res.render("forgotPass"); 
});

router.post("/forgotPassword",function(req,res){
    authController.forgotPassword(req.body.email,function(stat,message,verCode){
        req.session.verCode = verCode;
        req.session.verMail=email;
        req.flash(stat,message);
        res.render("verifyMail");
    });
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
        res.render('changePass',{token:req.params.token});
    } else {
        req.flash('popup', 'Invalid or Expired Link! Try again! Due to our authentication policy we dont recognize this device'
        +' please use the same device to reset password...');
        return res.redirect('/forgotPassword');
    }
});

router.post('/resetPassword', function(req, res) {
    var newPassword= req.body.pass;
    authController.resetPassword(req,function(stat){
        if(stat=='success'){
            req.session.verCode=null;
            req.session.verMail=null;
            req.flash("success","Password reset successfully! Login to Continue");
            res.redirect("/login");
        }else{
            req.flash('error', 'Password reset token is invalid or has expired.');
            res.redirect('/forgotPassword');  
        }
    });
});

// show register form
router.get("/register",function(req, res) {
    res.render("signup");
}); 


//handle sign up logic
router.get("/placements",function(req, res) {
    var tDate = funcs.tdate();
    var populate={
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    };
    placementController.listPlacementsInternships({},[],populate,function(all){
        res.render('placement/placement_list',
                    {company:all.cpny,internships: all.internships, todaysDate: tDate});
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
    var populate=[{
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    },{
          path: 'author',
          model: 'User',
          // match:{
          //       'college':req.user.college
          //   }
        }
    ];
    placementController.listPlacement({},[],populate,function(all){
        topTwo=[];
        topTwo.push(all[all.length-1]);topTwo.push(all[all.length-2]);
        res.send(topTwo);
    });    
});

module.exports = router;

