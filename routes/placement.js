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

var adminController = require('../lib/controller/admin');
var studentController = require('../lib/controller/student');
var placementHeadController = require('../lib/controller/placementHead');
var placementController    = require('../lib/controller/placement');
var funcs = require('../lib/CustomFunctions/functions');
var emailController = require('../lib/controller/email');

var fileUploadComponent = require('../lib/components/fileUploader');
var smsComponent = require('../lib/components/sms');


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
    smsComponent.sendSMS('+917892650591',"This is a test",function(info){
        console.log(info);
        res.redirect("/")
    })
});

router.get("/",function(req,res){
    res.render("placement/home");
});


router.get('/students',middleware.isAdminOrPlacement,function(req, res) {
    var populate = {
        path: 'author',
        model: 'User'
        // match:{
        //     'college':req.user.college
        // }
    };
    selectArray =['author','department','semester'];
    console.log(populate);
    studentController.listStudents({},selectArray,populate,function(list){
        // console.log(list);
        res.render('placement/student_list',{list:list});        
    }); 
});

router.delete('/students',middleware.isAdminOrPlacement, function(req, res, next) {
    // var usn = req.body.USN || req.query.USN;
    var userID = req.body.userID || req.query.userID;
    console.log(req.body);
    studentController.removeStudent({author:userID},function(data){
        console.log(data);
        req.flash("success","User deleted");
        res.json({success: true});
    });
});


router.get("/addNewPlacement",function(req,res){
    res.render("placement/addNewPlacement",{update:'none'});
});

router.post("/addNewPlacement", function(req,res){
    placementController.addNewPlacement(req,function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update New Drive");
            res.redirect("/placementHead/addNewPlacement");
        }
        else{
            console.log('Message sent: congo!!!!!');
            req.flash("success","Updated Placement Info");
            res.redirect("/placementHead/placements");
        }
    })
})


router.get("/updatePlacement/:id",function(req,res){
    placementController.findPlacement({'_id':req.params.id},[],'',function(record){
        res.render("placement/addNewPlacement",{update:record});
    });
});

router.post("/updatePlacement/:id", function(req,res){
    placementController.updatePlacement(req,{_id:req.params.id},function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update Drive");
            res.redirect("/placementHead/updatePlacement/"+req.params.id);
        }
        else{
            console.log('Message sent: congo!!!!!');
            req.flash("success","Updated Placement Info");
            res.redirect("/placementHead/placements");
        }
    }) 
})


router.get("/addNewInternship",function(req,res){
    res.render("placement/addNewInternship",{update:'none'});
});

router.post("/addNewInternship", function(req,res){
    placementController.addNewInternship(req,function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update New Internship");
            res.redirect("/placementHead/addNewInternship");
        }
        else{
            console.log('Message sent: congo!!!!!');
            req.flash("success","Updated Internship Info");
            res.redirect("/placementHead/placements");
        }
    });
});


router.get("/updateInternship/:id",function(req,res){
    Internship.findOne({'_id':req.params.id},function(err, internship) {
        if(err)
            console.log(err);
        res.render("placement/addNewInternship",{update:internship});
    });
});

router.post("/updateInternship/:id", function(req,res){
    placementController.updateInternship(req,{_id:req.params.id},function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update Internship");
            res.redirect("/placementHead/updateInternship/"+req.params.id);
        }
        else{
            console.log('Message sent: congo!!!!!');
            req.flash("success","Updated Internship Info");
            res.redirect("/placementHead/placements");
        }
    })   
});


router.get("/placements",function(req, res) {
    var tDate = funcs.tdate();
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
          match:{
                'college':req.user.college
            }
        }
    ];
    placementController.listPlacementsInternships({},[],populate,function(all){
        res.render('placement/viewPlacements',
                    {company:all.cpny,internships: all.internships, todaysDate: tDate});
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
});

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
    populate=[{
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    },{
          path: 'author',
          model: 'User',
          match:{
            'college':req.user.college
        }
    }];
    placementController.findPlacement({_id:req.params.id},[],populate,function(record){
        req.flash("error","Updated Info");
        res.render("placement/updatePlacedStudents",{company:record});
    });
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
    
    
    placementCalc.DeptPlaced(req.user.college,function(data1){
        placementCalc.placedData(req.user.college,function(data2){
            placementCalc.PlacedDeptStd(req.user.college,function(data3){
                res.send({
                    1:data1,
                    2:data2,
                    3:data3,
                });
            });
        });
    });
    // res.send({
    //     1: await placementCalc.DeptPlaced(req.user.college),
    //     2: await placementCalc.placedData(req.user.college),
    //     3: await placementCalc.PlacedDeptStd(req.user.college)
    // });   
});

router.get('/placementStat',async function(req, res) {
    res.render('placement/graphs');
    
});

module.exports = router;


