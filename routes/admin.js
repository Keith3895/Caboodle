var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var VTUmarks1 = require("../models/marks2");
var Student = require("../models/student");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var cheerio = require('cheerio');
var scrape = require('scrape');
var aSync = require('async');
var request = require('request');
var async = require('async');
var smtpTransport = require('nodemailer-smtp-transport');
var urls1 = [];
var resultAnalysis = require("./resultAnalysis");
for(var i= 1;i<=180;i++){
    urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13CS"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13ME"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13EC"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13IS"+("00" + i).slice(-3))
}
for(var j= 1;j<=180;j++){
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13CS"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13ME"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13EC"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13IS"+("00" + j).slice(-3))
}

router.get("/",middleware.isAdmin,function(req,res){
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
            res.render('admin/home',{lengths:length});
        }); 
    });
    
});


router.get("/user_list/mobile",middleware.isAdmin,function(req, res) { // is login middleware
    // req.session.redirectTo = "/admin/user_list";
    User.find({}, function (err, users) {
        for(i=0;i<users.length;i++){
            if(users[i].userType== 'student'){
                if(users[i].dp == undefined){
                    users[i].dp ='/images/male5.jpg';
                    users[i].save();
                }
            }
        }
        res.send(users);
    });
    
});
router.get("/user_list",middleware.isAdminOrPlacement,function(req, res) { // is login middleware
    // req.session.redirectTo = "/admin/user_list";
    User.find({}, function (err, users) {
        res.render("admin/user_list",{Users:users});
    });
    
});

router.get('/student_list',middleware.isAdminOrPlacement,function(req, res) {
    Student.find({}).populate({
        path: 'author',
        model: 'User'
    }).exec(function(err,studs){
        res.render('admin/student_list',{list:studs});        
    });
});

router.post('/students/delete',middleware.isAdminOrPlacement, function(req, res, next) {
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

router.post('/users/delete', middleware.isAdminOrPlacement, function(req, res, next) {
    var userID = req.body.userID || req.query.userID;
    User.remove({'_id':userID }, function(err, user) {
        if (err) { 
            res.json({"error": err});
        } else { 
            res.json({success: true});
            req.flash("success","User removed");
        }
    })
});

router.get("/scrapeResults", middleware.isAdmin, function(req,res){
    // req.flash("success","Scrape Request initiated");
    // res.redirect("/")
    console.log("Scraping Initiated.....")
    var counter = 0;
    function f1(urls,len){
        counter = 0;
    scrape.concurrent(urls,100, function(url, callback) {
        if(url){
        request(url, function(error, response, html){
            var usn1 = url.split('usn=')[1];
            if(!error){
                var $ = cheerio.load(html);
                var usn = $('table tr').first().children().eq(1).text().split(': ')[1]; 
                if(usn){
                    var index = urls.indexOf(url);
                    urls.splice(index, 1);
                    var name = $('table tr').eq(1).children().eq(1).text().split(': ')[1];
                    // console.log("Name:",name);
                    var semMarks = [];
                    var dep = usn.substr(5,2);
                    $('.table').each(function(){
                        var semester = $(this).prev().text().split(': ')[1];
                        semester = parseInt(semester);
                        var subjectMarks = [];
                        $(this).children('tbody').each(function(){
                            var subjectCode = $(this).children().children().first().text();
                            var subjectName = $(this).children().children().eq(1).text();
                            var internalMarks = $(this).children().children().eq(2).text();
                            var externalMarks = $(this).children().children().eq(3).text();
                            var subjectTotal = $(this).children().children().eq(4).text();
                            var subjectResult = $(this).children().children().eq(5).text();
                            var subjects = {
                                subjectCode: subjectCode,
                            	subjectName: subjectName,
                            	internalMarks: internalMarks,	
                            	externalMarks: externalMarks,
                            	subTotal: subjectTotal,
                            	subResult: subjectResult
                            }
                            subjectMarks.push(subjects);
                        });
                        var semTotal = $(this).parent().next().children().first().children().first().children().last().text().split(': ')[1];;
                        var semResult = $(this).parent().next().children().last().children().last().children().last().text().split(': ')[1];
                        var semesterResult = {
                            sem: semester,
                        	subjects: subjectMarks,
                        	total: semTotal,
                        	result: semResult
                        }
                        semMarks.push(semesterResult);
                    })
                    // console.log("Dep:",dep);
                    // var studentResult = new VTUmarks({
                    //     name: name,
                    // 	usn: usn,
                    // 	department: dep,
                    // 	marks:semMarks
                    // });
                    var studentResult = {
                        name: name,
                    	usn: usn,
                    	department: dep,
                    	marks:semMarks
                    };
                    // console.log("Scraped:",usn);
                    VTUmarks.update({usn: usn},{$push:{marks:{$each: semMarks}}},{new:true,upsert:true},function(err1,studResult){
                        if(err1){
                            console.log("Error1: ",err1)
                            var index = urls.indexOf(url);
                            if (index > -1) {
                                urls.splice(index, 1);
                            }
                            counter = counter + 1;
                            len = len - 1;
                            if(len<=0&&urls.length<=0){
                                f2();
                            }
                            if(counter>=100){
                                // console.log("Again");
                                 f1(urls,urls.length);
                            }
                            
                        }
                        else{
                            console.log("Scraped:",usn);
                            var index = urls.indexOf(url);
                            if (index > -1) {
                                urls.splice(index, 1);
                            }
                            counter = counter + 1;
                            len = len - 1;
                            if(counter>=100){
                                // console.log("Again");
                                f1(urls,urls.length);
                            }
                            if(len<=0&&urls.length<=0){
                                f2();
                            }
                        }
                    })
                }
                else{
                    // console.log("Doesnt exist: ",usn1);
                    var index = urls.indexOf(url);
                    if (index > -1) {
                        urls.splice(index, 1);
                    }
                    counter = counter + 1;
                    len = len - 1;
                    if(len<=0&&urls.length<=0){
                        f2();
                    }
                    if(counter>=100){ 
                        // console.log("Again");
                        f1(urls,urls.length)
                    };
                    
                }
            }
            else{
                console.log("Error: ",usn1)
                counter = counter + 1;
                if(counter>=100){
                    console.log("Again");
                    f1(urls,urls.length);
                } 
            }
        });
        }
        else{
            console.log("Chill")
        }
    })
    }
    function f2(){
        console.log("Scraping Done");
        req.flash("success","Scraped");
        res.redirect("/viewResults");
    }
    f1(urls1);
});


router.get("/viewScrapedResults/a",function(req,res){
  VTUmarks1.find({'department':'CS'}).exec(function(err,records){
      if(err){
          console.log("Error: ",err);
      }
      else{
           
        //   resultAnalysis(records);
          res.send(resultAnalysis.results(records));
           
      }
  }) 
});


router.get("/addPlacementHead", middleware.isAdmin, function(req, res) {
    res.render("admin/addPlacementHead");
}); 


//handle sign up logic
router.post("/addPlacementHead", middleware.isAdmin, function(req, res){
    var newUser = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userType: "placementHead"
    });
    User.register(newUser, 'amcec', function(err, user){
        if(err){
            console.log("error: ",err)
            req.flash("error", err.message);
            return res.render("admin/addPlacementHead");
        }
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            host: "smtp.gmail.com",
            auth: {
                user: 'bkm.blore.c9@gmail.com', // Your email id
                pass: 'cloudnine' // Your password
            }
        });
        var text = 'Hello Admin,\n'+
                    '   This is a mail from GradBunker.\n'+
                    '   You added a new Placement Head ' + user.firstName+
                    '. If you did not add the Placement Head, click the '+
                    'following link to delete the account: '+
                    'https://erpdontdelete-mkb95.c9users.io/delete/'+
                    user._id+'  \n'+
                    '   Else Ignore this mail';
        var mailOptions = {
            from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
            to: 'bkm.blore@gmail.com', // list of receivers
            subject: 'You recently added a Placement Head', // Subject line
            text: text //, // plaintext body
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log('Message sent: congo!!!!!');
                res.redirect("/admin/verify?authToken="+user.authToken)
            };
        });
    });
});

router.get("/addStudent", middleware.isAdminOrPlacement, function(req, res) {
    res.render("admin/addStudent");
}); 


//handle sign up logic
router.post("/addStudent", middleware.isAdminOrPlacement, function(req, res){
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
            return res.render("admin/addStudent");
        }
        var newStudent = new Student({
            author: user._id,
            semester: req.body.sem,
        //     department: '',
        // 	placements: null,
        // 	gender: '',
        // 	DOB: '',
        // 	mobile1: null,
        // 	address: '',
        // 	tenthResult: {},
        // 	twelfthResult: {},
        // 	semResults: [{}],
        // 	semAggregate: null,
        // 	resumeLink: '',
        // 	certifications: [{}]
        })
        Student.create(newStudent,function(err,student){
            if(err){
                console.log(err);
            }
            else{
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    host: "smtp.gmail.com",
                    auth: {
                        user: 'bkm.blore.c9@gmail.com', // Your email id
                        pass: 'cloudnine' // Your password
                    }
                });
                
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
                    from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                    to: 'bkm.blore@gmail.com', // list of receivers
                    subject: 'You recently added a Student', // Subject line
                    html: htmlMail //, // plaintext body
                };
                
                var studentMailOptions = {
                    from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
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

router.get('/verify', middleware.isAdmin, function(req, res) {
    User.verifyEmail(req.query.authToken, function(err, existingAuthToken) {
        if(err) console.log('err:', err);
        else{
            req.flash('success', 'New User added and Verified');
            res.redirect("/admin");
        }
    });
});


module.exports = router;








