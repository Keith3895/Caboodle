var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
var LeaderBoard = require("../models/leaderboard");
var Student = require("../models/student");
var Excel = require('exceljs');
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var ejs = require('ejs');
const tempfile = require('tempfile');
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
var http = require('http');
var urlencode = require('urlencode');
var mkdirp = require('mkdirp');
var aSync = require('async');
require('dotenv').config();


var has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}
function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    auth: {
        user: 'bkm.blore.c9@gmail.com', // Your email id
        pass: 'cloudnine' // Your password
    }
});

// =================== external functoins ==============
var testAnalysisHead = require("./externalFunction/testAnalysisHead");
var placementCalc = require("./externalFunction/placementCalc");

// ===================================================
// var transporter = nodemailer.createTransport(ses({
    // accessKeyId: 'process.env.MailerKeyid',
//     secretAccessKey: 'process.env.MailerPsd'
// }));

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

var uploadData;
function fileUploader(i,file,uploadPath,noOfFiles,mailAttachments,filePaths){
    if(file[i].originalFilename!==''){
        var fileExtension=file[i].originalFilename.split(".");
        fileExtension = fileExtension[fileExtension.length - 1];
        var filename = Date.now()+file[i]['name']+'.'+fileExtension;
        var stream = fs.createReadStream(file[i].path);
        var params = {ACL: "public-read", Bucket: 'gradbunker', Key: uploadPath+'/'+filename,
            Body: stream
        };
        s3.upload(params, function(err, data) {
            if(err) console.log(err);
            else{
                filePaths.push(data.Location);
                mailAttachments.push({
                    filename: file[i].originalFilename,
                    path: data.Location
                })
                if(i<noOfFiles-1)
                    fileUploader(i+1,file,uploadPath,noOfFiles,mailAttachments,filePaths);
                else{
                    uploadData();
                }
            }
        });
    }else{
        if(i<noOfFiles-1)
            fileUploader(i+1,file,uploadPath,noOfFiles,mailAttachments,filePaths);
        else{
            uploadData();
        }
    }
}


router.get("/sms",function(req,res){
    console.log("In text")
    // Messages can only be sent between 9am to 9pm
    var msg=urlencode("Hello! This is a test");
    var number='+917892650591';
    var username='bkm.blore@gmail.com';
    var hash='e4e4a3e59ffa2ab4a6ed9bf7052f759d16140164d5c1b1a3d37cc7746ab67d9b';
    var sender='txtlcl';
    var data='username='+username+'&hash='+hash+'&sender='+sender+'&numbers='+number+'&message='+msg;
    var options = {
        host: 'api.textlocal.in',
        path: '/send?'+data
    };
    var callback = function(response) {
        var str = '';
        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
        });
    }
    http.request(options, callback).end();
});

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

router.get('/students',middleware.isPlacementHead,function(req, res) {
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


router.get("/addNewPlacement",function(req,res){
    res.render("placement/addNewPlacement",{update:'none'});
});

router.post("/addNewPlacement",async function(req,res){
    // console.log(req.body);
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var qualification = req.body.qualification;
    var sems=[],deps=[];
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    (typeof req.body.sendTodepartment === 'string') ? deps.push(req.body.sendTodepartment) : deps = req.body.sendTodepartment;
    var emails='',students;
    await Student.find({ semester: { $in: sems } , department: { $in: deps }}).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            console.log()
            records.forEach(function(record){
                // res.send(records);
                // if(/@gmail.com/.test(record.author.email))
                    emails = emails + ', '+ record.author.email;
            })
        }
    })
    // console.log()(typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var mailAttachments = [];
    var length = req.files.docs.length;
    var filePaths=[],count = 1;
    uploadData = function f2(){
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
    	time: req.body.lastDate,
    	eligibility: eligibility,
    	jobDescription: req.body.jobDescription, 
    	doc_links: filePaths,
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
                    console.log(emails);
                    mailOptions = {
                        from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
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
                    res.redirect("/placementHead/placements");
                    // callback(null,"It works");
                };
            });
        }
    })
    };
    fileUploader(0,req.files.docs,'PlacementUploads/',length,mailAttachments,filePaths);
});


router.get("/updatePlacement/:id",function(req,res){
    Placement.findOne({'_id':req.params.id},function(err, record) {
    if(err)
        console.log(err);
        // console.log(record);
    res.render("placement/addNewPlacement",{update:record});
    });
});

router.post("/updatePlacement/:id",async function(req,res){
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var qualification = req.body.qualification;
    var sems=[],deps=[];
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    (typeof req.body.sendTodepartment === 'string') ? deps.push(req.body.sendTodepartment) : deps = req.body.sendTodepartment;
    console.log(deps);
    console.log(sems);
    var emails='',students;
    await Student.find({ semester: { $in: sems } , department: { $in: deps }}).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                // res.send(records);
                // if(/@gmail.com/.test(record.author.email))
                    emails = emails + ', '+ record.author.email;
            })
        }
    })
    // console.log()(typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var mailAttachments = [];
    var length = req.files.docs.length;
    var filePaths=[],count = 1;
    uploadData = function f2(){
        Placement.findOne({_id:req.params.id},function(err,placement){
            if(err) console.log(err);
            else{
                if(mailAttachments.length<1){
                    placement.doc_links.forEach(function(fpath){
                        var splitPath = fpath.split("/")
                        mailAttachments.push({
                            filename: splitPath[splitPath.length - 1],
                            path: fpath
                        })
                    })
                }
                placement.author= req.user._id,
                placement.cName= req.body.cName,
            	placement.Package= req.body.package,
            	placement.jobLocation= req.body.jobLocation,
            	placement.qualification= qualification,
            	placement.department= department,
            	placement.skills= req.body.skills,
            	placement.designation= req.body.designation,
            	placement.driveLocation= req.body.driveLocation,
            	placement.date= req.body.driveDate,
            	placement.time= req.body.lastDate,
            	placement.eligibility= eligibility,
            	placement.jobDescription= req.body.jobDescription, 
            	placement.doc_links= filePaths
            	placement.save(function(){
            	    var html;
                    var mailOptions;
                    ejs.renderFile(template,{placement: placement}, function(err, html){
                        if (err) console.log(err);
                        else{
                            mailOptions = {
                                from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                                to: 'bkm.blore@gmail.com '+emails, // list of receivers
                                subject: placement.cName+'- ALERT! Placement Info Updated', // Subject line
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
                            res.redirect("/placementHead/placements");
                            // callback(null,"It works");
                        };
                    });
            	})
            }
        })
    }
    fileUploader(0,req.files.docs,'PlacementUploads/',length,mailAttachments,filePaths);
});



router.get("/addNewInternship",function(req,res){
    
    res.render("placement/addNewInternship",{update:'none'});
});

router.post("/addNewInternship",async function(req,res){
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var sems = [];
    var qualification = req.body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var emails,students;
    await Student.find({ semester: { $in: sems } }).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                emails = emails + ', '+ record.author.email;
            })
        }
    })
    var mailAttachments = [];
    var length = req.files.docs.length;
    var filePaths=[],count = 1;
    uploadData = function f2(){
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
    	doc_links: filePaths,
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
                        from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                        to: 'bkm.blore@gmail.com '+emails, // list of receivers
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
                    res.redirect("/placementHead/placements");
                    // callback(null,"It works");
                };
            });
        }
    })
    };
    fileUploader(0,req.files.docs,'InternshipUploads/',length,mailAttachments,filePaths);
    
});


router.get("/updateInternship/:id",function(req,res){
    Internship.findOne({'_id':req.params.id},function(err, internship) {
        if(err)
            console.log(err);
        res.render("placement/addNewInternship",{update:internship});
    });
    
});

router.post("/updateInternship/:id",async function(req,res){
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var sems = [];
    var qualification = req.body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var emails,students;
    await Student.find({ semester: { $in: sems } }).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                emails = emails + ', '+ record.author.email;
            })
        }
    })
    var mailAttachments = [];
    var length = req.files.docs.length;
    var filePaths=[],count = 1;
    uploadData = function f2(){
        Internship.findOne({_id:req.params.id},function(err,internship){
            if(err) console.log(err);
            else{
                if(mailAttachments.length<1){
                    internship.doc_links.forEach(function(fpath){
                        var splitPath = fpath.split("/")
                        mailAttachments.push({
                            filename: splitPath[splitPath.length - 1],
                            path: fpath
                        })
                    })
                }
                internship.author= req.user._id,
                internship.cName= req.body.cName,
            	internship.Package= req.body.package,
            	internship.internLocation= req.body.internLocation,
            	internship.duration= req.body.duration,
            	internship.qualification= qualification,
            	internship.department= department,
            	internship.skills= req.body.skills,
            	internship.designation= req.body.designation,
            	internship.interviewLocation= req.body.interviewLocation,
            	internship.lastDate= req.body.lastDate,
            	internship.eligibility= eligibility,
            	internship.internDescription= req.body.internDescription, 
            	internship.doc_links= filePaths,
            	internship.save(function(){
            	    var html;
                    var mailOptions;
                    ejs.renderFile(internshipTemplate,{internship: internship}, function(err, html){
                        if (err) console.log(err);
                        else{
                            mailOptions = {
                                from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
                                to: 'bkm.blore@gmail.com '+emails, // list of receivers
                                subject: internship.cName+'- Internship Update', // Subject line
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
                            res.redirect("/placementHead/placements");
                            // callback(null,"It works");
                        };
                    });
            	})
            }
        })
    }
    fileUploader(0,req.files.docs,'InternshipUploads/',length,mailAttachments,filePaths);
});

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
    }).exec(function(err,cpny){
        if(err)console.log("In placement error: ",err);
        if(!err){
            Internship.find({})
            .populate({
                path: 'registeredStudents',
                model:'Student',
                populate: {
                  path: 'author',
                  model: 'User'
                }
            }).exec(function(err2,internships){
                if(err2)console.log("Intern error: ",err2);
                if(!err2){
                    res.render('placement/viewPlacements',
                    {company:cpny,internships: internships, todaysDate: tDate});
                }
            })
        }
    });
});

router.delete("/placements/:id",function(req,res){
    function deletePlacement(record,registered,selected){
        if(record!==null){
            var registeredStudents=record.registeredStudents;
            Student.find({_id:{ $in: registeredStudents }},function(err2,students){
                if(err2) console.log(err2);
                else{
                    record.remove();
                    students.forEach(function(student,i){
                        remove(student[registered],record._id);
                        remove(student[selected],record._id);
                        student.save(function(err4){
                            if(err4) console.log(err4);
                            else{
                                if(i==students.length-1)
                                    req.flash("success","Record successfully deleted");
                            }
                        });
                    })
                }
            })
        }
    }
    Placement.findOne({_id:req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            deletePlacement(record,'registeredPlacements','selectedPlacements') /*Last 2 parameters are different for 
              placements/internships registered or selected. Refer student model.*/
        }
    })
    Internship.findOne({_id:req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            deletePlacement(record,'registeredInternships','selectedInternships') /*Last 2 parameters are different for 
              placements/internships registered or selected. Refer student model.*/
        }
    })
})

router.get("/registeredStudents/:id",function(req,res){
    Placement.findOne({'_id':req.params.id})
    .populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,record){
        if(err) console.log(err);
        else{
            if(record!==null){
                res.render("placement/viewRegisteredStudents",{company:record})    
            }
        }
    })
    Internship.findOne({'_id':req.params.id})
    .populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,record){
        if(err) console.log(err);
        else{
            if(record!==null){
                res.render("placement/viewRegisteredStudents",{company:record})    
            }
        }
    })
})

router.delete("/registeredStudents",function(req,res){
    function deleteRecord(record){
        if(record!==null){
            remove(record.registeredStudents,student_id);
            record.save(function(err2){
                if(err2) console.log(err2);
                else{
                    Student.findOne({_id:student_id},function(err3,student){
                        if(err3) console.log(err3);
                        else{
                            if(student!==null){
                                remove(student.registeredPlacements,record._id);
                                student.save(function(err4){
                                    if(err4) console.log(err4);
                                    else{
                                        req.flash("success","Student successfully deleted from list");
                                    }
                                });
                            }
                        }
                    })
                }
            });
        }
    }
    var company_id = req.body.cid || req.query.cid;
    var student_id = req.body.sid || req.query.sid;
    Placement.findOne({'_id':company_id}).exec(function(err,record){
        if(err) console.log(err);
        else{
            deleteRecord(record)
        }
    })
    Internship.findOne({'_id':company_id}).exec(function(err,record){
        if(err) console.log(err);
        else{
            deleteRecord(record)
        }
    })
})

router.get("/exportRegisteredStudents/:id",function(req,res){
    function exportList(company){
        var workbook = new Excel.Workbook();
        var worksheet,row,i=7;
        workbook.xlsx.readFile('RegisteredStudents.xlsx')
        .then(function() {
            worksheet = workbook.getWorksheet(1);
            row = worksheet.getRow(1);
            row.getCell(3).value=company.cName;
            row = worksheet.getRow(3);
            row.getCell(3).value="Drive Date: "+company.date;
            row.getCell(4).value="Drive Location:";
            row.getCell(5).value=company.driveLocation;
            company.registeredStudents.forEach(function(student){
                row = worksheet.getRow(i);
                row.getCell(1).value = i - 6;
                row.getCell(2).value = student.USN;
                row.getCell(3).value = student.author.firstName+' '+student.author.lastName;
                row.getCell(4).value = student.author.email;
                row.getCell(5).value = student.mobile1;
                row.getCell(6).value = student.tenthResult.Percentage;
                row.getCell(7).value = student.twelfthResult.Percentage;
                row.getCell(8).value = student.semAggregate
                row.getCell(9).value = student.department;
                row.commit();
                i= i + 1;
            })
            var tempFilePath = tempfile(company.cName+'.xlsx');
            console.log('file is to be written'+tempFilePath);
            workbook.xlsx.writeFile(tempFilePath).then(function() {
                console.log('file is written'+tempFilePath);
                res.sendFile(tempFilePath, function(err){
                    if(err)
                        console.log('---------- error downloading file: ' + err);
                    else{
                        console.log("File Downloaded");
                    }
                });
            });
        })
    }
    Placement.findOne({'_id':req.params.id})
    .populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,company){
        if(err) console.log(err);
        else{
            if(company!==null){
                exportList(company)
            }
        }
    })
    Internship.findOne({'_id':req.params.id})
    .populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,company){
        if(err) console.log(err);
        else{
            if(company!==null){
                exportList(company)
            }
        }
    })
})

router.get("/updatePlacementStats/:id",function(req,res){
    Placement.findOne({'_id':req.params.id}).populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,record){
        if(err) console.log(err);
        else{
            // res.send({company:record});
            req.flash("error","Updated Info")
            res.render("placement/updatePlacedStudents",{company:record}) 
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
                        console.log(req.body[placed]);
                    }
                }else{
                    record.selectedStudents = listOfPlacedStudents;
                    record.save();
                    Student.find({'_id': { $in: record.selectedStudents}})
                    .exec(function(err1,students){
                        if(err1) console.log(err1);
                        else{
                            students.forEach(function(student){
                                student.placements++;
                                if(!has(student.selectedPlacements,record._id)){
                                    student.selectedPlacements.push(record._id);
                                    student.save();
                                }
                            })
                            req.flash("success","Placement Stats Updated!");
                            // res.render("placement/viewPlacedStudents",{students: docs,company:record})
                            res.redirect("/placementHead/updatePlacementStats/"+req.params.id); 
                        }
                    })
                }
            }
        }
    })
})

router.get("/updateInternshipStats/:id",function(req,res){
    Internship.findOne({'_id':req.params.id}).populate({
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    }).exec(function(err,record){
        if(err) console.log(err);
        else{
            res.render("placement/updateInterns",{company:record})    
        }
    })
})

router.post("/updateInternshipStats/:id",function(req,res){
    var placed = null,listOfPlacedStudents=[];
    Internship.findOne({'_id':req.params.id},function(err,record){
        if(err) console.log(err);
        else{
            for(var i=0;i<=req.body.noOfStudents;i++){
                placed = 'placed' + i;
                if(i<req.body.noOfStudents){
                    if(req.body[placed]!=='no'){
                        listOfPlacedStudents.push(req.body[placed]);
                    }
                }else{
                    record.selectedStudents = listOfPlacedStudents;
                    record.save();
                    Student.find({'_id': { $in: record.selectedStudents}})
                    .exec(function(err1,students){
                        if(err1) console.log(err1);
                        else{
                            students.forEach(function(student){
                                if(!student.selectedInternships.includes(record._id)){
                                    student.selectedInternships.push(record._id);
                                    student.save();
                                }
                            })
                            req.flash("success","Internship Stats Updated!");
                            res.redirect("/updateInternshipStats/"+req.params.id);    
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
    var sems=[];
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var StudentIDs ='bkm.blore@gmail.com';
    // StudentIDs +=',keith30895@gmail.com,mkb.viru4@gmail.com';
    var update=req.body.reminder;
        
    Student.find({ semester: { $in: sems }})
    .populate('author').exec(function (err, students) {
        if(err){
             req.flash('error',"No matching Records found to send mail!")
        } 
        else{
            students.forEach(function(student){
                StudentIDs = StudentIDs+', '+student.author.email;
                console.log("Mails: ",StudentIDs);
            });
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
        if(br[0].entry.length!=0){
            Student.findOne({'author': br[0].entry[0].author},function(err,student){
            testAnalysisHead(req,student.PlacementTestResults[student.PlacementTestResults.length - 1][0],res);
        });
        }
        
    });
});


router.get('/placementStats',async function(req, res) {
    
    
    
    res.send({
        1: await placementCalc.DeptPlaced(),
        2: await placementCalc.placedData(),
        3: await placementCalc.PlacedDeptStd()
    });   
});

router.get('/placementStat',async function(req, res) {
    res.render('placement/graphs');
    
});

module.exports = router;



