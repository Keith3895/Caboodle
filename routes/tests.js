var express = require("express"),
    router  = express();
var http = require('https');
var ejs = require('ejs');
var pdf = require('html-pdf');
var conversion = require("phantom-html-to-pdf")();
const template = './views/tests/solutionsTemplate.ejs';
var middleware = require("../middleware");
var Student = require("../models/student");
var LeaderBoard = require("../models/leaderboard");
var GlobalLeaderBoard = require("../models/globalLeaderBoard");
var Questions = require("../models/question");
var resultAnalysis = require("./externalFunction/placementTestAnalysis");
var testExternalFuncs = require("./externalFunction/testExternalFuncs");
// var page=require('webpage').create();
var phantom = require('phantom');
    var dataRecieved,questionset=0,timestamp;
function refreshQuestions(){
    http.get("https://external-api-keithfranklin.c9users.io/random/25", function(resp) {
    	var body = ''; 
    	resp.on('data', function(data){
    		body += data;
    	});
    	resp.on('end', function() {
    		var parsed = JSON.parse(body);
    // 		console.log(parsed);
    		dataRecieved= parsed;
    		timestamp = (new Date().getTime() / 1000 | 0).toString(16)+'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
                                return (Math.random() * 16 | 0).toString(16);
                            }).toLowerCase();
            questionset++;
            LeaderBoard.create({testId:timestamp},function(err, entry) {
                console.log("lederboard created");
            });
            for(i=0;i<dataRecieved.length;i++){
                dataRecieved[i].timestamp= timestamp;
                Questions.create(dataRecieved[i],function(err, questionEnter) {
                   if(err)
                    console.log(err);
                });
            }
    	});
    })
    .on('error', function(e) {
    	console.log("Got error: " + e.message);
    });
}
    
router.get('/',middleware.isLoggedIn,function(req,res){
    req.session.cookie.maxAge = (50*60*1000);
    res.render('tests/preTest');
});
router.get('/testEnv',middleware.isLoggedIn,function(req, res) {
    req.session.cookie.maxAge = (50*60*1000);
    res.render('tests/tests',{questionset:questionset});
});

router.get('/questions',middleware.isLoggedIn,function(req,res){
    req.session.timestamp = timestamp;
    Questions.find({},function(err, questionsSend) {
        req.session.timestamp = questionsSend[0].timestamp;    
        timestamp = questionsSend[0].timestamp;
        var last = questionsSend[5];
        last.comprehension = "bla bla bla bla";
        console.log(last);
        questionsSend.push(last);
        
        res.send(questionsSend);
    });
});

router.get('/refreshQuestions',middleware.isAdmin,function(req,res){


    testExternalFuncs.studentSkiped();
    Questions.remove({},function(err,stat) {
        console.log('removed');
        // console.log(stat);
    });
    refreshQuestions();
    req.session.timestamp=timestamp;
    res.redirect('/test');
});
router.post('/getAnalysis',function(req,res){
    var PlacementTestResults ={
        id:req.session.timestamp,
        marks: req.body.marks,
        typeCount:req.body.typeCount,
        typeCorrect:req.body.typeCorrect,
        type : req.body.types
    };
    Student.findOne({'author':req.user._id},function(err,foundStudent){
        if(err)
            console.log(err);
        for(i=0;i<foundStudent.PlacementTestResults.length;i++){
            console.log("here as"+req.session.timestamp);
            if(foundStudent.PlacementTestResults[i][0].id== req.session.timestamp)
                return res.send('rendered');
        }
            
        foundStudent.PlacementTestResults.push(PlacementTestResults);
        foundStudent.save();
        testExternalFuncs.addToLeaderBoard(PlacementTestResults,req);
        resultAnalysis(req,PlacementTestResults,res);
    });
});

router.get('/status',function(req, res) {
    
        LeaderBoard.find({}).sort({'_id':-1}).exec(function(err, entry) {
            questionset = entry.length;
            entry=entry[0];
            var Submit = entry.entry.length;
            Student.find({},function(err, std) {
                var total = std.length;
                res.send({Submit:Submit,total:total,questionset:questionset});
            });
            
            // entry=entry[0];
            // var newEnt;
            // for(i=0;i<entry.entry.length;i++){
            //     if(entry.entry[i].marks==-2)
            //         newEnt = entry.entry[i];
            // }
            // entry.entry=newEnt;
            // entry.save();
            
            
        });
    
});
router.get('/removeResults',middleware.isAdmin,function(req, res) {
    Student.find({},function(err,std){
        for(i in std){
            std[i].PlacementTestResults=[];
            std[i].save();
        }
        res.send(std);
    });
});
router.get('/student',function(req, res) {
    Student.find({},function(err,std){
        res.send(std);
    });
});
router.get('/leader',function(req, res) {
    LeaderBoard.find({},function(err, List) {
        res.send(List);
    });
});
router.get('/leader/:id',function(req, res) {
    LeaderBoard.remove({'_id':req.params.id},function(err, List) {
        res.send(List);
    });
});


router.get('/Glist',function(req, res) {
    GlobalLeaderBoard.find({}).populate({
        path:'author',
        madel:'User'
    }).exec(function(err, std) {
        res.send(std);
    });
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

// router.get('/Gleader',function(req, res) {
    
//     Student.find({},function(err, std) {
//       for(i=0;i<std.length;i++){
//             var entry = {
//                 author:std[i].author,
//                 xp:0,
//                 test:0
//             };   
//           GlobalLeaderBoard.create(entry,function(err,bEn){
//              if(err)
//                 console.log(err);
//           });
//       } 
//       res.send("bla");
//     });
    
// });
module.exports = router;