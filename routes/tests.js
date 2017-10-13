var express = require("express"),
    router  = express();
var ejs = require('ejs');
var pdf = require('html-pdf');
var conversion = require("phantom-html-to-pdf")();
const template = './views/tests/solutionsTemplate.ejs';
var middleware = require("../middleware");
var LeaderBoard = require("../models/leaderboard");
var resultAnalysis = require("./externalFunction/placementTestAnalysis");
var testExternalFuncs = require("./externalFunction/testExternalFuncs");
// var page=require('webpage').create();
var phantom = require('phantom');
var testController = require('../lib/controller/test');
var studentController = require('../lib/controller/student');
var LeaderBoardController = require('../lib/controller/LeaderBoard');
    var dataRecieved,questionset=0,timestamp;

    
router.get('/',middleware.isLoggedIn,function(req,res){
    req.session.cookie.maxAge = (50*60*1000);
    req.session.test = true;
    res.render('tests/preTest');
});
router.get('/testEnv',middleware.isLoggedIn,function(req, res) {
    if(req.session.test){
        req.session.cookie.maxAge = (50*60*1000);
        res.render('tests/tests',{questionset:questionset});
    }
    else 
        res.send('no access');
});

router.get('/questions',middleware.isLoggedIn,function(req,res){
    console.log(req.user.college);
    req.user.college=(req.user.college)?req.user.college:req.session.college;
    testController.getQuestions(req.user.college,function(questionset){
        console.log(questionset.questions[0].timestamp);
        if(questionset.questions[0].timestamp){
            req.session.timestamp = questionset.questions[0].timestamp;
            timestamp = req.session.timestamp;
        }
        res.send(questionset);
    });    
});

router.post('/refreshQuestions',middleware.isAdmin,function(req,res){
    testController.requestQuestions(req.body.college,function(stats){
        req.session.college=req.body.college;
        res.redirect('/test');    
    });
});
router.get('/negSkip',middleware.isAdmin,function(req, res) {
    testExternalFuncs.studentSkiped();
    res.redirect('/leader');
});
router.post('/getAnalysis',middleware.isLoggedIn,function(req,res){
    
    var PlacementTestResults ={
        id:req.session.timestamp,
        marks: req.body.marks,
        typeCount:req.body.typeCount,
        typeCorrect:req.body.typeCorrect,
        type : req.body.types
    };
    console.log(PlacementTestResults);
    studentController.findStudent(req.user._id,['PlacementTestResults'],'',function(foundStudent){
        if(foundStudent){
            for(i=0;i<foundStudent.PlacementTestResults.length;i++){
                console.log("here as"+req.session.timestamp);
                if(foundStudent.PlacementTestResults[i][0].id== req.session.timestamp)
                    return res.send('rendered');
            }    
            foundStudent.PlacementTestResults.push(PlacementTestResults);
            foundStudent.save();
            testExternalFuncs.addToLeaderBoard(PlacementTestResults,req);
            resultAnalysis(req,PlacementTestResults,res);
        }else
            res.send('rendered');
    });
});

router.get('/status',function(req, res) {
    
    LeaderBoardController.getStats(req.user.college,function(data){
        res.send(data);
    });
    
});
router.get('/removeResults/:college',middleware.isAdmin,function(req, res) {
    LeaderBoardController.clearAll(req.params.college);
});
router.get('/solutionPDF',function(req,res){
    // var usn = req.params.id.toUpperCase();
    // console.log("Im in");
    res.render("tests/solutionsTemplate",{studentAnswers: ['A','B','A','D','C','B'],usn:'1AM13CS088',name:'Mohan Kumar B'});
    // ejs.renderFile(template,{studentAnswers: ['A','B','A','D','C','B'],usn:'1AM13CS088',name:'Mohan Kumar B'}, 
    //     function(err1, renderedHtml){
    //         if (err1) console.log("Err1",err1);
    //         else{
    //             conversion({ html: renderedHtml }, function(err2, pdf) {
    //                 if(err1) console.log("Err2",err2)
    //                 console.log(pdf.numberOfPages);
    //                 pdf.stream.pipe(res);
    //             });
    //         }
    //     })
});


router.get('/solutionPDF2',function(req,res){
    // var usn = req.params.id.toUpperCase();
    // console.log("Im in");
    var filename = 'test10082017.pdf';
    phantom.create().then(function(ph) {
        ph.createPage().then(function(page) {
            page.property('viewportSize',{
                width: 595,
                height: 800
            });
            page.property('paperSize',  {
                format: 'Letter',
                orientation: 'potrait',
                border: '0.2in'
            });
            page.property('zoomFactor', 0.75);
            page.open('https://erpdontdelete-mkb95.c9users.io/test/solutionPDF').then(function(){
                page.render(filename).then(function(){
                    console.log("PDF Success");
                    res.download(filename,function(){
                        page.close();
                        ph.exit();
                    });
                    // res.send("Downloaded pdf");
                    
                });
                // phantom.exit();
                
            });
        });
    });
    
});
module.exports = router;