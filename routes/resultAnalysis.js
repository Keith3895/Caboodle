var datas={};
var self= module.exports = {




onlyUnique : function (value, index, self) { 
    return self.indexOf(value) === index;
},


    unique: function (array){
        return unique = array.filter( self.onlyUnique );
    },
    avg:function (elmt){
        var sum = 0;
        for( var i = 0; i < elmt.length; i++ ){
            sum += parseInt( elmt[i], 10 ); //don't forget to add the base
        }

        return sum/elmt.length;
    },
    
    
    
    
 
        results:function (data){
            datas.subjectCode=[];
            for(i in data){
                for(j in data[i].marks){
                    for(k in data[i].marks[j].subjects){
                        datas.subjectCode.push(data[i].marks[j].subjects[k].subjectCode);
                    }
                }
            }
            datas.subjectCode= self.unique(datas.subjectCode);
            datas.sevenCode=[],datas.sixCode=[];
            for(i in datas.subjectCode){
                if(datas.subjectCode[i]){
                    if(datas.subjectCode[i].charAt(datas.subjectCode[i].length-2) == '7' || datas.subjectCode[i].charAt(datas.subjectCode[i].length-3) == '7')
                    datas.sevenCode.push(datas.subjectCode[i]);
                    if(datas.subjectCode[i].charAt(datas.subjectCode[i].length-2) == '6' || datas.subjectCode[i].charAt(datas.subjectCode[i].length-3) == '6')
                        datas.sixCode.push(datas.subjectCode[i]);    
                }
                
            }
            datas.fails={};
            for(i in datas.sevenCode){
                datas.fails[datas.sevenCode[i]] = 0;
            }    
            for(i in data)
                for(j in data[i].marks)
                    for(k in data[i].marks[j].subjects)
                        for(a in datas.sevenCode)
                            if(data[i].marks[j].subjects[k].subjectCode == datas.sevenCode[a])
                                if(data[i].marks[j].subjects[k].subResult=='F')
                                datas.fails[datas.sevenCode[a]]++;
            
                            datas.marks={};
            for(i in datas.sevenCode){
                datas.marks[datas.sevenCode[i]] = [];
            }    
            for(i in data)
                for(j in data[i].marks)
                    for(k in data[i].marks[j].subjects)
                        for(a in datas.sevenCode)
                            if(data[i].marks[j].subjects[k].subjectCode == datas.sevenCode[a])
                                datas.marks[datas.sevenCode[a]].push(data[i].marks[j].subjects[k].subTotal);
            for(a in datas.sevenCode)
                datas.marks[datas.sevenCode[a]]= self.avg(datas.marks[datas.sevenCode[a]]);
            
            datas.marks1={};
            for(i in datas.sixCode){
                datas.marks1[datas.sixCode[i]] = [];
            }    
            for(i in data)
                for(j in data[i].marks)
                    for(k in data[i].marks[j].subjects)
                        for(a in datas.sixCode)
                            if(data[i].marks[j].subjects[k].subjectCode == datas.sixCode[a])
                                datas.marks1[datas.sixCode[a]].push(data[i].marks[j].subjects[k].subTotal);
            
            for(a in datas.sixCode)
                datas.marks1[datas.sixCode[a]]= self.avg(datas.marks1[datas.sixCode[a]]);
            
            datas.pass = [0,0,0,0,0,0,0,0];
            datas.fail = [0,0,0,0,0,0,0,0];
            datas.laterA = [0,0,0,0,0,0,0,0];
            datas.Fail=0;
            datas.Pass=0;
            datas.later=0;
            for(i in data){
            for(j in data[i].marks){
                switch(data[i].marks[j].sem){
                    case 1:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[0]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[0]++;
                        else
                            datas.pass[0]++;
                    break;
                    case 2:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[1]++;
                        else if(data[i].marks[j].result =='TO BE ANNOUNCED LATER')
                            datas.laterA[1]++;
                        else
                            datas.pass[1]++;
                    break;
                    case 3:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[2]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[2]++;
                        else
                            datas.pass[2]++;
                    break;
                    case 4:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[3]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[3]++;
                        else
                            datas.pass[3]++;
                    break;
                    case 5:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[4]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[4]++;
                        else
                            datas.pass[4]++;
                    break;
                    case 6:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[5]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[5]++;
                        else
                            datas.pass[5]++;
                    break;
                    case 7:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[6]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[6]++;
                        else
                            datas.pass[6]++;
                    break;
                    case 8:
                        if(data[i].marks[j].result == 'FAIL') 
                            datas.fail[7]++;
                        else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                            datas.laterA[7]++;
                        else
                            datas.pass[7]++;
                    break;
                }
                // if(data[i].marks[j].result == 'FAIL')
                //     datas.Fail++;    
                // else if(data[i].marks[j].result == 'TO BE ANNOUNCED LATER')
                //     datas.later++;
                // else
                //     datas.Pass++;
            }
            
            }
            for(i in datas.pass){
                datas.Pass+=datas.pass[i];
                datas.Fail+=datas.fail[i];
                datas.later+=datas.laterA[i];
            }
            return datas;
        }
};


