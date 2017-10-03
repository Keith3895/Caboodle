var express = require("express");
var router  = express.Router();
var ejs = require('ejs');
var passport = require("passport");
var User = require("../models/user");
var Student = require("../models/student");
var VTUmarks = require("../models/vtuMarks");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
var LeaderBoard = require("../models/leaderboard");
var middleware = require("../middleware");
var async = require("async");


router.post("/login/", function(req, res, next){
    req.session.cookie.maxAge = (50*60*1000);
    console.log(req.body);
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
            // console.log("got one! "+user);
            console.log("got one mobile");
        if(user.userType=='placementHead'){
            req.logIn(user, function(err) {
              if (err) { 
                  res.send(['no']);
                  return next(err);
              }
            return res.send(['yes']);
            });
        }else{
            res.send(['no']);
        }
    })(req, res, next);
    
});

router.get('/home',function(req, res) {
    
    
    
    
});

router.get('/placementData',function(req, res) {
    var data={};
    Student.find({},function(err,students){
        var placedCount=0;
        for(i=0;i<students.length;i++){
            if(students[i].placements>0)
                placedCount++;
        }
        data.placedCount=placedCount;
        data.numberOfStudents = students.length;
        res.send(data);
    });
});

router.get('/leaderData',function(req, res) {
    testGraph(res);
});

module.exports = router;




    
    function testGraph(res){
        var arrAvg=[],arr=[];
        var tests={};
        LeaderBoard.find({},function(err,boards){
            // console.log(boards);
            for(i=0;i<boards.length;i++){
                tests[boards[i].testId] = [];
                for(j=0;j< boards[i].entry.length;j++){
                    tests[boards[i].testId].push(boards[i].entry[j].marks);
                }
            }
            // mul= tests.length
            // console.log(tests);
            var j=1;
            for(i in tests){
                var sum=0;
                for(k in tests[i]){
                    arr.push({
                        x: j,
                        y: parseInt(tests[i][k])
                    });
                    sum += parseInt(tests[i][k]);
                }
                if(isNaN(sum/tests[i].length))
                    sum = 0;
                else 
                    sum = sum/tests[i].length;
                arrAvg.push({
                    x: j,
                    y:sum
                });
                j++;
            }
            console.log(arrAvg);
            res.send({arrAvg:arrAvg,arr:arr});       
        });
        
    }