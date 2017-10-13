var ejs = require('ejs');

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
    }
}



