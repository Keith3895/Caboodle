var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
var Student = require("../models/student");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var mkdirp = require('mkdirp');
var ejs = require('ejs');
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
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
require('dotenv').config();
// var transporter = nodemailer.createTransport(ses({
//     accessKeyId: 'process.env.MailerKeyid',
//     secretAccessKey: 'process.env.MailerPsd'
// }));
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    auth: {
        user: 'bkm.blore.c9@gmail.com', // Your email id
        pass: 'cloudnine' // Your password
    }
});

var has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}
var studentController = require('../lib/controller/student');
var placementController = require('../lib/controller/placement');
var userHandler = require('../lib/data_handles/user');
router.get("/",function(req,res){
    studentController.findStudent(req.user._id,[],'author',function(student){
        res.render("student/viewProfile",{student: student});
    });
});
router.get("/registerPlacement/:id",middleware.isStudent,function(req,res){
    var currentUser = req.user;
    studentController.registerPlacement(req.params.id,currentUser,function(status){
        if(status==='success'){
            console.log("Successful registration")
            req.flash("success","You are successfully registered!");
            res.redirect("/student/viewPlacements");
        }else{
            console.log("Already registered")
            req.flash("error","You are already registered!");
            res.redirect("/student/viewPlacements");
        }
    });
    studentController.registerInternship(req.params.id,currentUser,function(status){
        if(status==='success'){
            console.log("Successful registration")
            req.flash("success","You successfully applied!");
            res.redirect("/student");
        }else{
            console.log("Already registered")
            req.flash("error","You are already registered!");
            res.redirect("/student");
        }
    });
});


router.get("/updateProfile",function(req,res){
    tudentController.findStudent(req.user._id,[],'author',function(student){
        res.render("student/updateProfile",{student: student});
    });
});

router.post("/updateProfile",function(req,res){
    var body=req.files,filePath={},noOfFiles=0;
    var semTotal=0,noOfSems=0,semAggregate;
    for(var prop in body){
        noOfFiles++;
        filePath[prop]='';
    }
    var file=[],ct=0,fileExtension,filename,stream,params;
    var allFormFileNames=[];
    var student,studentSemester,noOfCertificationsFiles,semesterResultUploads=[];
    var total=0;
    Student.findOne({'USN':req.body.usn},function(err,studentRecord){
        if(err) console.log(err);
        else{
            student = studentRecord;
            studentSemester = studentRecord.semester;
            noOfCertificationsFiles = noOfFiles - studentSemester - 3;
            for(var prop in body) {
                file[ct]=req.files[prop];
                file[ct]['name']=prop;
                allFormFileNames.push(prop);
                if(ct<noOfFiles-1){ ct=ct+1;}
                else{ console.log("going to uploader");fileUploader(0);}
            }
        }
    });
    
    function fileUploader(i){
        if(file[i].originalFilename!==''){
            fileExtension=file[i].originalFilename.split(".");
            fileExtension = fileExtension[fileExtension.length - 1];
            filename = file[i]['name']+'.'+fileExtension;
            stream = fs.createReadStream(file[i].path);
            params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'studentUploads/'+req.body.usn+'/'+filename,
                Body: stream
            };
            s3.upload(params, function(err, data) {
                if(err) console.log(err);
                else{
                    filePath[file[i]['name']] = data.Location;
                    if(i<noOfFiles-1)
                        fileUploader(i+1);
                    else{
                        console.log("Going to path uploader");
                        pathUploader();
                    }
                }
            });
        }else{
            filePath[file[i]['name']]='';
            if(i<noOfFiles-1)
                fileUploader(i+1);
            else{
                console.log("Going to path uploader");
                pathUploader();
            }
        }
    }
    function counter(){
        total++;
        if(total===noOfFiles) textUploader();
    }
    function pathUploader(){
        // console.log("reportlinkLen: ",student.tenthResult.reportLink.length);
        if(filePath['tenthCard']=='' && student.tenthResult.reportLink && student.tenthResult.reportLink.length>=5){  
            filePath['tenthCard']=student.tenthResult.reportLink;
            counter();
        }else{ counter(); }
        if(filePath['twelfthCard']=='' && student.twelfthResult.reportLink && student.twelfthResult.reportLink.length>=5){  
            filePath['twelfthCard']=student.twelfthResult.reportLink;
            counter();
        }else{ counter(); }
        if(filePath['resume']=='' && student.resumeLink && student.resumeLink.length>=5){  
            filePath['resume']=student.resumeLink;
            counter();
        }else{counter();}
        for(var j=1;j<=studentSemester;j++){
            if(filePath['semCard'+j]=='' && student.semResults[j-1] && (student.semResults[j-1].reportLink!==undefined)
            && student.semResults[j-1].reportLink.length>=5){  
                semesterResultUploads.push({ 
                    sem: j, 
                    Percentage: req.body['semPercentage'+j], 
                    reportLink: student.semResults[j-1].reportLink
                });
                counter();
            }else{
                semesterResultUploads.push({ 
                    sem: j, 
                    Percentage: req.body['semPercentage'+j], 
                    reportLink: filePath['semCard'+j]
                });
                counter();
            }
        }
        for(var k=1;k<=noOfCertificationsFiles;k++){
            if(req.body['title'+k]!==""){
                student.certifications.push({
                    description: req.body['title'+k],
                    docLink: filePath['title'+k+'Card']
                })
                student.save();
                counter();
            }else{
                counter();
            }
        }
    }
    function textUploader(){
        student.gender= req.body.gender;
        student.department = req.body.department;
        student.DOB= req.body.dob;
        student.mobile1= req.body.phone;
        student.address= req.body.address;
        student.tenthResult= { board: req.body.tenthBoard, Percentage: req.body.tenthPercentage, 
                    yearPassed: req.body.tenthPassYear, reportLink: filePath['tenthCard']};
        student.twelfthResult= { board: req.body.twelfthBoard, Percentage: req.body.twelfthPercentage, 
                    yearPassed: req.body.twelfthPassYear, reportLink: filePath['twelfthCard']};
        student.semResults= semesterResultUploads;
        student.resumeLink= filePath['resume'];
        student.save(function(err1,studentInfo){
            if(err1){
                console.log("Error: ",err1)
                req.flash("success","Student profile not updated");
                res.redirect("/");
            } 
            else{
                student.semResults.forEach(function(sem,i){ 
                    if(sem.Percentage!=null){
                        noOfSems = noOfSems + 1;
                    }
                    if(i===student.semResults.length){
                        semAggregate = semTotal/noOfSems;
                        semAggregate = Math.round(semAggregate * 100) / 100;
                        student.semAggregate=semAggregate;
                        student.save();
                    } 
                    semTotal = semTotal + sem.Percentage;
                })
                console.log("Student Profile Updated ");
                req.flash("success","Profile Updated");
                res.redirect("/student/viewProfile");
            }
        })
    }
});

router.get("/viewProfile",middleware.isLoggedIn, function(req,res){
    req.session.redirectTo = '/student/viewProfile';
    studentController.findStudent(req.user._id,[],'author',function(student){
        res.render("student/viewProfile",{student: student});
    });
});

router.post("/updateDP",function(req,res){
    var profilePic = req.body.dp;
    userHandler.editUser({'email':req.user.email},{"dp":profilePic},function(){
        res.redirect("/student");
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
    res.render("student/viewFile",{link:req.query.link});
});
router.get('/viewPlacements', function(req, res) {
    var populate={
        path: 'registeredPlacements',
        model:'placement'
    };
    var selectQuery = ['registeredPlacements','selectedPlacements'];
    studentController.findStudent(req.user._id,selectQuery,populate,function(student){
        res.render("student/viewPlacement",{student:student});
    });    
});


router.get('/testAnalysis',middleware.isLoggedIn,function(req, res) {
    studentController.findStudent(req.user._id,['PlacementTestResults'],'',function(student){
        res.render('student/PlacementAnalysis',{testResult:student.PlacementTestResults});    
    });
});

router.get('/getAnalysis',function(req,res){
    studentController.findStudent(req.user._id,['PlacementTestResults'],'',function(student){
        if(student.PlacementTestResults.length>0)
            resultAnalysis(req,student.PlacementTestResults[student.PlacementTestResults.length-1][0],res);
    });
});


module.exports = router;











