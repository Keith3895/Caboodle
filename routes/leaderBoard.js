var express = require("express"),
    router  = express();
var ejs = require('ejs');
var middleware = require("../middleware");
var Student = require("../models/student");
var User = require("../models/user");
var LeaderBoard = require("../models/leaderboard");
var GlobalLeaderBoard = require("../models/globalLeaderBoard");

router.get('/',function(req,res){
    res.render('leaderBoard/LeaderHomepage');
});

router.get('/test',function(req,res){
    // Placement.find({}).sort({'_id':-1}).limit(2).exec(function(err,cpny){
    //             res.send(cpny);
    //         });
    LeaderBoard.find({}).sort({'_id':-1}).limit(1).populate({
        path:'entry.author',
        model: 'User'
    }).exec(function(err,br){
        // console.log(br[0].entry[br[0].entry.length-1]);
        req.session.timestamp = br.testId;
        board = br[0];
        board.entry.sort(function(a,b){
            return b.xp-a.xp;
        });
        res.render('leaderBoard/testLeadBoardComp',{board:board});
        // res.send(board); 
    });
    // console.log(req.session.timestamp);
    // if(req.session.timestamp)
    // LeaderBoard.findOne({'testId':req.session.timestamp}).populate({
    //     path:'entry.author',
    //     model: 'User'
    // }).exec(function(err,board){
    //     board.entry.sort(function(a,b){
    //         return b.xp-a.xp;
    //     });
    //     // console.log(board)
    //     res.render('leaderBoard/testLeadBoardComp',{board:board});
    //     // res.send(board);
    // });
});

router.get('/overall',function(req, res) {
    GlobalLeaderBoard.find({}).populate({
        path:'author',
        madel:'User'
    }).exec(function(err,board){
        if(err)
            console.log(err);
        board.sort(function(a,b){
            return b.xp-a.xp;
        });
        var perce=[];
        
        for(i=1;i<=board.length;i++){
            board[i-1].percentile=((board.length-i)/board.length)*100;
        }
        // console.log(board);
        res.render('leaderBoard/overAllComp',{board:board,maxLength:board.length});    
    });
    
});

module.exports = router;