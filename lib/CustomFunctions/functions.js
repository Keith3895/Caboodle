var ejs = require('ejs');
var Excel = require('exceljs');
var tempfile = require('tempfile');
var studentController = require('../controller/student');

module.exports.has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}

module.exports.remove = function (array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

module.exports.tdate = function(){
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
    var tDate = today.split("-");
    return tDate;
}

let ComputeToRegex=function(body,callback){
    var sems=[],deps=[];
    (typeof body.semesters === 'string') ? sems.push(body.semesters) : sems = body.semesters;
    (typeof body.sendTodepartment === 'string') ? deps.push(body.sendTodepartment) : deps = body.sendTodepartment;
    callback({ semester: { $in: sems } , department: { $in: deps }});
}

module.exports.formatPlacement=function(body,user,callback){
    var eligibility = body.tenth+'-'+body.twelfth+'-'+body.engg;
    var qualification = body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    var sems=[],deps=[];
    (typeof body.semesters === 'number') ? sems.push(parseInt(body.semesters)) : sems = body.semesters;
    (typeof body.sendTodepartment === 'string') ? deps.push(body.sendTodepartment) : deps = body.sendTodepartment;
    var computedSearchParameter = { semester: { $in: sems } , department: { $in: deps }};
    var placementDetails = {
        author: user._id,
        cName: body.cName,
        Package: body.package,
        jobLocation: body.jobLocation,
        qualification: qualification,
        department: department,
        skills: body.skills,
        designation: body.designation,
        driveLocation: body.driveLocation,
        driveDate: body.driveDate,
        lastDate: body.lastDate,
        eligibility: eligibility,
        jobDescription: body.jobDescription
    };
    callback(placementDetails,computedSearchParameter)
}

module.exports.formatInternship=function(body,user,callback){
    var eligibility = body.tenth+'-'+body.twelfth+'-'+body.engg;
    var qualification = body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    var sems=[],deps=[];
    (typeof body.semesters === 'number') ? sems.push(parseInt(body.semesters)) : sems = body.semesters;
    (typeof body.sendTodepartment === 'string') ? deps.push(body.sendTodepartment) : deps = body.sendTodepartment;
    var computedSearchParameter = { semester: { $in: sems } , department: { $in: deps }};
    var internshipDetails = {
        author: user._id,
        cName: body.cName,
    	Package: body.package,
    	internLocation: body.internLocation,
    	duration: body.duration,
    	qualification: qualification,
    	department: department,
    	skills: body.skills,
    	designation: body.designation,
    	interviewLocation: body.interviewLocation,
    	lastDate: body.lastDate,
    	eligibility: eligibility,
    	internDescription: body.internDescription
    };
    callback(internshipDetails,computedSearchParameter)
}
    
    
let renderTemplate = function(template,data,callback){
    ejs.renderFile(template,data, function(err, html){
        if (err) return err;
        else{
            callback(html);
        }
    });
}

module.exports.getRenderedTemplate = function(templateData,routeType,callback){
    switch(routeType){
        case 'addPlacement': renderTemplate('./views/emails/addPlacement.ejs',templateData,function(html){
                                callback(html);
                            });
                             break;
                             
        case 'updatePlacement': renderTemplate('./views/emails/addPlacement.ejs',templateData,function(html){
                                    callback(html);
                                });
                                break;
                             
        case 'addInternship': renderTemplate('./views/emails/addInternship.ejs',templateData,function(html){
                                    callback(html);
                                });
                              break;
                             
        case 'updateInternship': renderTemplate('./views/emails/addInternship.ejs',templateData,function(html){
                                    callback(html);
                                });
                                 break;
        case 'forgotPassword': renderTemplate('./views/emails/forgotPassword.ejs',templateData,function(html){
                                    callback(html);
                                });
                                 break;
                                 
        case 'sendReminder': renderTemplate('./views/emails/sendReminder.ejs',templateData,function(html){
                                callback(html);
                            });
                             break;
    }
}


module.exports.exportList   = function(company,res,callback){
    var workbook = new Excel.Workbook();
    var worksheet,row,i=7;
    workbook.xlsx.readFile('RegisteredStudents.xlsx')
    .then(function() {
        worksheet = workbook.getWorksheet(1);
        row = worksheet.getRow(1);
        row.getCell(3).value=company.cName;
        row = worksheet.getRow(3);
        row.getCell(3).value="Drive Date: "+company.date;
        row.getCell(4).value="Drive Location:";
        row.getCell(5).value=company.driveLocation;
        company.registeredStudents.forEach(function(student){
            row = worksheet.getRow(i);
            row.getCell(1).value = i - 6;
            row.getCell(2).value = student.USN;
            row.getCell(3).value = student.author.firstName+' '+student.author.lastName;
            row.getCell(4).value = student.author.email;
            row.getCell(5).value = student.mobile1;
            row.getCell(6).value = student.tenthResult.Percentage;
            row.getCell(7).value = student.twelfthResult.Percentage;
            row.getCell(8).value = student.semAggregate
            row.getCell(9).value = student.department;
            row.commit();
            i= i + 1;
        })
        var tempFilePath = tempfile(company.cName+'.xlsx');
        console.log('file is to be written'+tempFilePath);
        workbook.xlsx.writeFile(tempFilePath).then(function() {
            console.log('file is written'+tempFilePath);
            res.sendFile(tempFilePath, function(err){
                if(err)
                    console.log('---------- error downloading file: ' + err);
                callback(err,"File Downloaded");
            });
        });
    })
}


module.exports.updatePlacementOrInternshipStats     =   function(req,record,type,callback){
    var placed = null,listOfPlacedStudents=[];
      for(var i=0;i<=req.body.noOfStudents;i++){
      placed = 'placed' + i;
      if(i<req.body.noOfStudents){
          if(req.body[placed]!=='no'){
              listOfPlacedStudents.push(req.body[placed]);
              console.log(req.body[placed]);
          }
      }else{
        record.selectedStudents = listOfPlacedStudents;
        record.save();
        studentController.getAllDetails({'_id':{ $in: record.selectedStudents}},[],'author',function(error,students){
          if(!error){
            students.forEach(function(student){
                if(type==='placement'){
                    student.placements++;
                    if(!module.exports.has(student.selectedPlacements,record._id)){
                        student.selectedPlacements.push(record._id);
                        student.save();
                    }
                }else if(type==='internhsip'){
                    if(!module.exports.has(student.selectedInternships,record._id)){
                        student.selectedInternships.push(record._id);
                        student.save();
                    }
                }
            })
            callback(error,students);
          }
        })
      }
    }
}
