var Placement = require("../../models/placement");
var Internship = require("../../models/internship");
var LeaderBoard = require("../../models/leaderboard");
var Student = require("../../models/student");

var studentController = require('../../lib/controller/student');
var placementController = require('../../lib/controller/placement');

var cfuncs      =       require('../../lib/CustomFunctions/functions');
var functions={

placedData: async function(college){
    var data={};
    await studentController.listStudents({selectedPlacements: { $eq: [] }},['_id'],{
        path:'author',
        model:'User',
        select:'_id',
        match:{college:college}
    },function(list){
        data.UnplacedCount = list.length;
    });
    await studentController.listStudents({selectedPlacements: { $ne: [] }},['_id'],{
        path:'author',
        model:'User',
        select:'_id',
        match:{college:college}
    },function(list){
        data.placedCount=list.count;
    })
    // await console.log(data);
    return data;
},

DeptPlaced: async function (college){
    var OverallDeptRating={},lineData={};
    var departments=[];
    var todaysDate = cfuncs.tdate();
    
    await Placement.find({}).populate([{
        path:'selectedStudents',
        model:'Student'
    },
    {
        path:'author',
        model:'User',
        select:'_id',
        match:{college:college}
    }
    ]).exec(async function(err,placement){
        placement = await placement.filter(function(placements) {
              return placements.author;
          });
        for(i=0;i<placement.length;i++){
            var deptCount={};
            var pDate= placement[i].date.split("-");
            if(!(todaysDate[1]<pDate[1])||((todaysDate[1]===pDate[1])&&(todaysDate[0]<=pDate[0]))){
                for(j=0;j<placement[i].selectedStudents.length;j++){
                    if(placement[i].selectedStudents.length>0){
                        var student = placement[i].selectedStudents[j];
                        // for(k)
                        // await Student.findOne({'USN':placement[i].placedStudents[j]},function(err, student) {
                            // if(err)console.log(err);
                            departments.push(student.department); 
                            if(deptCount[student.department]){
                                deptCount[student.department]++;
                            }else{
                                deptCount[student.department]=1;
                            }
                            if(OverallDeptRating[student.department]){
                                OverallDeptRating[student.department]++;
                            }else{
                                OverallDeptRating[student.department]=1;
                            }
                        // });    
                    }
                }
                
                for(k=0;k<departments.length;k++){
                    
                    if(lineData[departments[k]]){
                        len = lineData[departments[k]].length;
                        if(lineData[departments[k]][len-1].x!=i)    
                             lineData[departments[k]].push({
                                x:i,
                                y: deptCount[departments[k]]==undefined? 0:deptCount[departments[k]],
                                Cname: placement[i].cName
                            });
                    }else{
                         lineData[departments[k]]=[{
                            x:i,
                            y:deptCount[departments[k]]==undefined? 0:deptCount[departments[k]],
                            Cname: placement[i].cName
                        }];
                        
                    }
                }
            }
        }
    });
    return lineData;
},


PlacedDeptStd: async function(college){
    var placedCount={},datasend={},dept={};
    await studentController.listStudents({},['author'],{
        path:'author',
        model:'User',
        select:'_id',
        match:{college:college}
    },async function(list){
        list= await list.map(function(std){
            return std.author;
        });
        Student.aggregate([
            { $match: {
                'selectedPlacements': {$ne:[ ]},
                'author':{$in:list}
            }},
            {
                $group: {
                    _id: '$department',  
                    count: {$sum: 1},

                }
            }
        ]).exec( function (err, result) {
            console.log(result);
            result.forEach(function(res){
                datasend.placed[res._id]=res.count;
            });
        });
        Student.aggregate([
            { $match: {
                'author':{$in:list}
            }},
            {
                $group: {
                    _id: '$department',  
                    count: {$sum: 1},

                }
            }
        ]).exec( function (err, result) {
            console.log(result);
            result.forEach(function(res){
                datasend.count[res._id]=res.count;
            });
        });
    });
    return datasend;
}
}

module.exports = functions;