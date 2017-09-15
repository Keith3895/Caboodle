
// ======================================== Result Analysis functions ================================
var Student = require("../../models/student");
var LeaderBoard = require("../../models/leaderboard");

module.exports = function (req,requestedTest,res){
    var returnData;
    var range=[0,0,0,0,0,0];
    var arrAvg=[],arr=[];
    
    function one(){
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
            // console.log(arrAvg);
            two();
        });
    }
    function two(){
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
        three();
    });
    
    
    }
    function three(){
        returnData ={
        requestedTest:requestedTest,
        arrAvg:arrAvg,
        arr:arr,
        range:range
    };
    // console.log(returnData);
    res.render('placement/placementAnalysis',{returnData:returnData});
    }
    one();
    
}