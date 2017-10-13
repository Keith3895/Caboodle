var Placement = require("../../models/placement");
var Internship = require("../../models/internship");
var LeaderBoard = require("../../models/leaderboard");
var Student = require("../../models/student");

var functions={

placedData: async function(college){
    var data={};

    await Student.find({selectedPlacements: { $eq: [] }},function(err,students){
        console.log(students);
    });
    // await console.log(data);
    return data;
},

DeptPlaced: async function (college){
    var OverallDeptRating={},lineData={};
    var departments=[];
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = dd+'-'+mm+'-'+yyyy;
    var todaysDate = today.split("-");
    
    await Placement.find({}).populate({
        path:'selectedStudents',
        model:'Student'
    }).exec(async function(err,placement){
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
    await Student.find({college:college},function(err, students) {
        for(i=0;i<students.length;i++){
            if(students[i].selectedPlacements.length>0){
                placedCount[students[i].department]=(placedCount[students[i].department]>=0)?placedCount[students[i].department]+1:1;
                
            }
            else
                dept[students[i].department]=(dept[students[i].department]>=0)?dept[students[i].department]+1:1;
        }
        datasend.placed=placedCount;
        datasend.count=dept;
    });
    return datasend;
}


};

module.exports = functions;