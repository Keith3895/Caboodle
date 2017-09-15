var Student = require("../../models/student");
var LeaderBoard = require("../../models/leaderboard");
var GlobalLeaderBoard = require("../../models/globalLeaderBoard");
var Questions = require("../../models/question");
// var resultAnalysis = require("./externalFunction/placementTestAnalysis");

var functions = {
    
    
    addToLeaderBoard : function (testResult,req){
        var xp = parseInt(testResult.marks) * .75 ;
        for(i in testResult.type){
            if(testResult.type[i]== 'Quantitative aptitude')
                xp+= parseInt(testResult.typeCorrect[i])*1.5;
            else if(testResult.type[i]== 'Logical Reasoning')
                xp+= parseInt(testResult.typeCorrect[i])*1.5;
            else if(testResult.type[i]== 'Verbal Reasoning')
                xp+= parseInt(testResult.typeCorrect[i])*2;
            else 
                xp+= parseInt(testResult.typeCorrect[i])*3;
        }
        functions.CheckCons(req.user._id,testResult,function(response){
            console.log(response);
            xp+= parseInt(response);
        });
        var BoardEntry =
                        {
                            author : req.user._id,
                            marks: testResult.marks,
                            xp : xp
                        }
                    ;
                    LeaderBoard.findOne({'testId':testResult.id}, function(err,entry){
                        if(err)
                            console.log(err);
                            entry.entry.push(BoardEntry);
                            entry.save();
                            functions.enterGlobal(BoardEntry);
                    });
                    
    },
    
    
    
    CheckCons: function(id,requestedTest, callback){  // checks if consecutive test score is equal
    
        Student.findOne({'author':id},function(err, student) {
           var length = student.PlacementTestResults.length;
          if(length >3){
              if(requestedTest.marks==student.PlacementTestResults[length-2][0].marks){
                  if(student.PlacementTestResults[length-3][0].marks == requestedTest.marks)
                    return callback(2);
              }
          }
          return callback(0);
        });
        
    },
    
    
    
    enterGlobal: function (boardEntry) {
        GlobalLeaderBoard.findOne({'author': boardEntry.author},function(err,Gentry){
            if(Gentry==null){
                console.log("yup not there");
                var enter = {
                    author:boardEntry.author,
                    test:1,
                    xp:boardEntry.xp
                };
                GlobalLeaderBoard.create(enter,function(err, bEn) {
                    if(err)
                        console.log(err);
                    console.log('so we entered ');
                });
            }
            else{
                Gentry.xp+=boardEntry.xp;
                Gentry.test++;
                Gentry.save();
            }
        });
    }
};
module.exports = functions;