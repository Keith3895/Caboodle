var VTUmarks = require("../../models/vtuMarks");
var Users = require("../../models/user");
var has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}



var functions = {
    
  PassOrFail    :   async function(filter){
      var pass={},fail={},passDept={},failDept={};
      var searchObj = {$regex: /^((?!all).)*$/i};
      if(filter!='ALL')
        searchObj = {$regex: new RegExp(filter,'i')};
      await VTUmarks.aggregate([
            { $unwind: "$marks" },
            { $match: {
                'marks.result': {$regex: /fail/i},
                'department': searchObj
            }},
            {
                $group: {
                    _id: '$marks.sem',  //$region is the column name in collection
                    count: {$sum: 1}
                }
            }
        ]).exec( function (err, result) {
            if (err) {
                console.log(err);
            } else {
                result.forEach(function(re,i){
                        fail[i+1]=(re.count);
                });
            }
        });
      await VTUmarks.aggregate([
        { $unwind: "$marks" },
        { $match: {
            'marks.result': {$regex: /^((?!fail).)*$/i},
            'department': searchObj
        }},
        {
            $group: {
                _id: '$marks.sem',  //$region is the column name in collection
                count: {$sum: 1}
            }
        }
        ]).exec( function (err, result) {
            if (err) {
                console.log(err);
            } else {
                result.forEach(function(res,i){
                    pass[i+1]=res.count;
                });
            }
        });
      
      if(filter=='ALL'){
          await VTUmarks.aggregate([
            { $unwind: "$marks" },
            { $match: {
                'marks.result': {$regex: /^((?!fail).)*$/i},
            }},
            {
                $group: {
                    _id: '$department',  //$region is the column name in collection
                    count: {$sum: 1}
                }
            }
            ]).exec( function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    result.forEach(function(res,i){
                        passDept[res._id]=res.count;
                    });
                }
            });
            
          await VTUmarks.aggregate([
            { $unwind: "$marks" },
            { $match: {
                'marks.result': {$regex: /fail/i}
            }},
            {
                $group: {
                    _id: '$department',  //$region is the column name in collection
                    count: {$sum: 1}
                }
            }
            ]).exec( function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    result.forEach(function(res,i){
                        failDept[res._id]=res.count;
                    });
                }
            });
      }
      
        
      return {pass:pass,fail:fail,passDept:passDept,failDept:failDept};
  },
  SubjectPassVsFail :   async function(){
      var department='CS',sem='6',data={};
      var subjectsMarks ={},pass={},fail={};
      await VTUmarks.find({  
            $and:[
          {
              department:department
          },
          {
              'marks.sem':sem
          }
          ]
          },['marks.subjects','marks.sem']).exec(function(err,allStudents){
                if(err)
                    console.log(err);
                allStudents.forEach(function(student){
                    student.marks.forEach(function(marks){
                        if(marks.sem==sem){
                            marks.subjects.forEach(async function(subject){
                                var code =subject.subjectCode;
                                if(subject.subResult == 'F'){
                                    fail[code]=(fail[code])?fail[code]+1:1;
                                }else {
                                    pass[code]=(pass[code])?pass[code]+1:1;
                                }
                                
                                if(subjectsMarks[code])
                                    subjectsMarks[code].push(subject.subTotal);
                                else{
                                    subjectsMarks[code]=[]; 
                                    subjectsMarks[code].push(subject.subTotal);
                                }
                            });
                        }
                    });
                });                          
                // data = allStudents;
          });
        return {subjectsMarks:subjectsMarks,pass:pass,fail:fail};
  },
  ResultTypes : async function(dept,sem){
    var ret ={};
    var searchObj = {$regex: /^((?!all).)*$/i};
      if(dept!='ALL')
        searchObj = {$regex: new RegExp(dept,'i')};
        if(!sem){
            sem={$in:[1,2,3,4,5,6,7,8]};
        }
    await VTUmarks.aggregate([
        { $unwind: "$marks" },
        { $match: {
                'department': searchObj,
                'marks.sem': sem
            }},
        {
            $group: {
                _id: '$marks.result',  //$region is the column name in collection
                count: {$sum: 1}
            }
        }
    ]).exec( function (err, result) {
        if (err) {
            // next(err);
        } else {
            result.forEach(function(res){
                ret[res._id]=res.count;
            });
        }
    });
    return ret;
  },
  
};

module.exports = functions;