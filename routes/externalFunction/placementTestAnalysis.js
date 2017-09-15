
// ======================================== Result Analysis functions ================================
var Student = require("../../models/student");
var LeaderBoard = require("../../models/leaderboard");

module.exports = function (req,requestedTest,res){
    var returnData;
    var types=['Quantitative aptitude','Logical Reasoning','Verbal Reasoning','Puzzles'];
    var lineMarks=[],typeCorrect=[0,0,0,0],indTypeCorrect=[0,0,0,0],indTypeCount=[0,0,0,0],range=[0,0,0,0,0,0];
    function one(){
        Student.findOne({'author':req.user._id},function(err,Student){
            var testResults = Student.PlacementTestResults;
            // console.log(testResults[0][0].marks);    
            for(i=0;i< testResults.length;i++){
                lineMarks.push(testResults[i][0].marks);
                for(k in types){
                    for(a in testResults[i][0].type){
                    if(testResults[i][0].type[a] == types[k]){
                        indTypeCorrect[k]+=parseInt(testResults[i][0].typeCorrect[a]);
                        indTypeCount[k]+=parseInt(testResults[i][0].typeCount[a]);
                    }}
                }
            }
            lineMarks.push(requestedTest.marks);
            two();
            console.log(lineMarks);
            // console.log(indTypeCorrect);
            // console.log(indTypeCount);
        });
    }
    function two(){
        var numberOfStudents=[0,0,0,0];
        Student.find({},function(err, std) {
        if(err)
            console.log(err);
            for(i=0;i<std.length;i++){
                var testResults=std[i].PlacementTestResults;
                for(j=0;j<testResults.length;j++){
                    if(requestedTest.id==testResults[j][0].id){
                        for(a in types){
                            for(k in testResults[j][0].type){
                                if(testResults[j][0].type[k]==types[a]){
                                    typeCorrect[a]+=parseInt(testResults[j][0].typeCorrect[k]);
                                    numberOfStudents[a]++;
                                }
                            }
                        }
                    }
                }
                
            }
            // console.log(numberOfStudents);
            // console.log(typeCorrect);
            for(a in typeCorrect){
                typeCorrect[a]=Math.ceil(typeCorrect[a]/numberOfStudents[a]);
            }
            // console.log(typeCorrect);
            three();
        });
        
    
    }
    function three(){
        LeaderBoard.findOne({'testId': requestedTest.id},function(err, entry) {
        
        for(i in entry.entry){
            entry.entry[i].marks = parseInt(entry.entry[i].marks);
            if(entry.entry[i].marks>=0 && entry.entry[i].marks<=3)
                range[0]++;
            else if(entry.entry[i].marks>3 && entry.entry[i].marks<=7)
                range[1]++;
            else if(entry.entry[i].marks>7 && entry.entry[i].marks<=13)
                range[2]++;
            else if(entry.entry[i].marks>13 && entry.entry[i].marks<=20)
                range[3]++;
            else if(entry.entry[i].marks>20 && entry.entry[i].marks<=25)
                range[4]++;
            else if(entry.entry[i].marks>25 && entry.entry[i].marks<=30)
                range[5]++;   
        }
        // for(i in range)
            // range[i]=(range[i]/entry.entry.length )*100;
        // console.log(range);
        four();
    });
    
    
    }
    function four(){
        returnData ={
        requestedTest:requestedTest,
        types:types,
        lineMarks:lineMarks,
        typeCorrect:typeCorrect,
        indTypeCount:indTypeCount,
        indTypeCorrect:indTypeCorrect,
        range:range
    };
    // console.log(returnData);
    res.render('tests/testAnalysis',{returnData:returnData});
    }
    one();
    
}