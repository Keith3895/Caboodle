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
require('dotenv').config();


// =================== external functoins ==============
var testAnalysisHead = require("./externalFunction/testAnalysisHead");
var placementCalc = require("./externalFunction/placementCalc");

var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } )
var S3FS = require('s3fs'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
router.use(multipartyMiddleware);

var adminController = require('../lib/controller/admin');
var studentController = require('../lib/controller/student');
var placementHeadController = require('../lib/controller/placementHead');
var placementController    = require('../lib/controller/placement');
var cfuncs = require('../lib/CustomFunctions/functions');
var emailController = require('../lib/controller/email');

var fileUploadComponent = require('../lib/components/fileUploader');
var smsComponent = require('../lib/components/sms');


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
    var selectArray =['author','department','semester'];
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
    var tDate = cfuncs.tdate();
    var populate={
        path: 'registeredStudents',
        model: 'Student',
        populate: {
            path: 'author',
            model: 'User',
            match:{
                'college':req.user.college
            }
        }
    };
    placementController.listPlacementsInternships({},[],populate,function(all){
        res.render('placement/viewPlacements',
                    {company:all.cpny,internships: all.internships, todaysDate: tDate});
    });
});

router.delete("/placements/:companytype/:id",function(req,res){
    if(req.params.companytype==='placement'){
        placementController.deletePlacement({_id:req.params.id},function(err,status){
            if(err){
                console.log(err);
                req.flash("error","Could not delete placement! Please contact Admin!");
                res.redirect("/placementHead/placements");
            }else{
                console.log("Placement deleted");
                req.flash("success","Deleted Placement successfully");
                res.redirect("/placementHead/placements");
            }
        })
    }else if(req.params.companytype==='internship'){
        placementController.deleteInternship({_id:req.params.id},function(err,status){
            if(err){
                console.log(err);
                req.flash("error","Could not delete internship! Please contact Admin!");
                res.redirect("/placementHead/placements");
            }else{
                console.log("Internship deleted");
                req.flash("success","Deleted Internship successfully");
                res.redirect("/placementHead/placements");
            }
        })
    }
});


router.get("/registeredStudents/:companytype/:id",function(req,res){
    var searchParameter = {'_id':req.params.id};
    var selectQuery = [];
    var populate = {
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    };
    if(req.params.companytype==='placement'){
        placementController.findPlacement(searchParameter,selectQuery,populate,function(error,placement){
            if(error) console.log(error);
            else{
                if(placement!==null){
                    res.render("placement/viewRegisteredStudents",{company:placement})    
                }
            }
        })
    }else if(req.params.companytype==='internship'){
        placementController.findInternship(searchParameter,selectQuery,populate,function(error,internship){
            if(error) console.log(error);
            else{
                if(internship!==null){
                    res.render("placement/viewRegisteredStudents",{company:internship})    
                }
            }
        })
    }
})

router.delete("/registeredStudents",function(req,res){
    var company_id = req.body.cid || req.query.cid;
    var student_id = req.body.sid || req.query.sid;
    placementController.deleteRegisteredPlacementStudents({'_id':company_id},student_id,function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Student could not be deleted from list");
            res.render("/placementHead/registeredStudents/placement/"+company_id);
        }else{
            console.log("Registered student removed successfully");
            req.flash("success","Student successfully deleted from list");
            res.render("/placementHead/registeredStudents/placement/"+company_id);
        }
    })
    placementController.deleteRegisteredInternshipStudents({'_id':company_id},student_id,function(error,info){
        if(error){
            console.log(error);
            req.flash("error","Student could not be deleted from list");
            res.render("/placementHead/registeredStudents/internship/"+company_id);
        }else{
            console.log("Registered student removed successfully");
            req.flash("success","Student successfully deleted from list");
            res.render("/placementHead/registeredStudents/internship/"+company_id);
        }
    })
});

router.get("/exportRegisteredStudents/:id",function(req,res){
    var searchParameter = {'_id':req.params.id};
    var selectQuery = [];
    var populate = {
        path: 'registeredStudents',
        model: 'Student',
        populate: {
          path: 'author',
          model: 'User'
        }
    };
    placementController.findPlacement(searchParameter,selectQuery,populate,function(error,placement){
        if(error) console.log(error);
        else{
            if(placement!==null){
                cfuncs.exportList(placement,res,function(error1,info){
                    if(error1) console.log(error1);
                    else console.log(info);
                })
            }
        }
    })
    placementController.findInternship(searchParameter,selectQuery,populate,function(error,internship){
        if(error) console.log(error);
        else{
            if(internship!==null){
                cfuncs.exportList(internship,res,function(error1,info){
                    if(error1) console.log(error1);
                    else console.log(info);
                })
            }
        }
    })
});


router.get("/updatePlacementStats/:id",function(req,res){
    var searchParameter = {_id:req.params.id};
    var selectQuery = [];
    var populate={
        path: 'registeredStudents',
        model: 'Student',
        populate: {
            path: 'author',
            model: 'User',
            match:{
                'college':req.user.college
            }
        }
    };
    placementController.findPlacement(searchParameter,selectQuery,populate,function(error,record){
        if(error){
            req.flash("error","Could not find Placement");
            res.redirect("/placementHead/placements");
        }else{
            res.render("placement/updatePlacedStudents",{company:record});
        }
    });
});

router.post("/updatePlacementStats/:id",function(req,res){
    var searchParameter = {'_id':req.params.id};
    var selectQuery = [];
    var populate = {};
    placementController.updatePlacementStats(searchParameter,selectQuery,populate,function(error,updatedStudentRecords){
        if(error){
            console.log("Couldnt update stats");
            req.flash("error","Could not update stats");
            res.redirect("/updatePlacementStats/"+req.params.id);
        }else{
            console.log("Updated Stats");
            req.flash("success","Successfully Updated Placement Stats");
            res.redirect("/updatePlacementStats/"+req.params.id);
        }
    })
})

router.get("/updateInternshipStats/:id",function(req,res){
    var searchParameter = {_id:req.params.id};
    var selectQuery = [];
    var populate={
        path: 'registeredStudents',
        model: 'Student',
        populate: {
            path: 'author',
            model: 'User',
            match:{
                'college':req.user.college
            }
        }
    };
    placementController.findInternship(searchParameter,selectQuery,populate,function(error,record){
        if(error){
            req.flash("error","Could not find Internship");
            res.redirect("/placementHead/placements");
        }else{
            res.render("placement/updateInterns",{company:record});
        }
    });
})

router.post("/updateInternshipStats/:id",function(req,res){
    var searchParameter = {'_id':req.params.id};
    var selectQuery = [];
    var populate = {};
    placementController.updateInternshipStats(searchParameter,selectQuery,populate,function(error,updatedStudentRecords){
        if(error){
            console.log("Couldnt update stats");
            req.flash("error","Could not update stats");
            res.redirect("/updateInternshipStats/"+req.params.id);
        }else{
            console.log("Updated Stats");
            req.flash("success","Successfully Updated Internship Stats");
            res.redirect("/updateInternshipStats/"+req.params.id);
        }
    })
})


router.get("/sendReminder",function(req,res){
    res.render("placement/sendReminder");
});

router.post("/sendReminder",function(req,res){
    placementController.sendReminder(req,function(error,info){
        if(error){
            req.flash('error',"No matching Records found to send mail!");
            res.redirect("/sendReminder");
        }else{
            console.log('email sent: congo!!!!!');
            req.flash("success","Update sent to students");
            res.redirect("/placementHead");
        }
    });
});


router.get('/view',function(req, res) {
    var searchCondition = {};
    var selectQuery = [];
    var populate = '';
    placementController.listPlacement(searchCondition,selectQuery,populate,function(placements){
        res.send(placements);
    })
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


