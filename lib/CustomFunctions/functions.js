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

module.exports.formatPlacement=function(body){

    var eligibility = body.tenth+'-'+body.twelfth+'-'+body.engg;
    var qualification = body.qualification;
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    var newPlacement = {
        author: body.user._id,
        cName: body.cName,
        Package: body.package,
        jobLocation: body.jobLocation,
        qualification: qualification,
        department: department,
        skills: body.skills,
        designation: body.designation,
        driveLocation: body.driveLocation,
        date: body.driveDate,
        time: body.lastDate,
        eligibility: eligibility,
        jobDescription: body.jobDescription, 
        doc_links: filePaths,
    };
}


module.exports.ComputeToRegex=function(body){
    var sems=[],deps=[];
          (typeof body.semesters === 'string') ? sems.push(body.semesters) : sems = body.semesters;
            (typeof body.sendTodepartment === 'string') ?
                   deps.push(body.sendTodepartment) : deps = body.sendTodepartment;
    return { semester: { $in: sems } , department: { $in: deps }};
}

