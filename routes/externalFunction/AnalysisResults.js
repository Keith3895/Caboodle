var VTUmarks = require("../../models/vtuMarks");
var has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}

var functions = {
    
  PassOrFail    :   function(){
      var pass={},fail={};
      VTUmarks.find({},function(err,students){
          students.forEach(function(student,i){
              student.marks.forEach(function(sems,j){
                  console.log(sems.result);
                if(sems.result == 'FAIL'){
                    fail[sems.sem]=(fail[sems.sem])?fail[sems.sem]+1:1;
                }else {
                    pass[sems.sem]=(pass[sems.sem])?pass[sems.sem]+1:1;
                }
              });
          });
          console.log(fail);
          console.log(pass);
      });
  }
    
};

module.exports = functions;