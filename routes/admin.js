var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Student = require("../models/student");
var VTUmarks = require("../models/vtuMarks");
var VTUmarks1 = require("../models/marks2");
var middleware = require("../middleware");
var nodemailer = require('nodemailer');
var cheerio = require('cheerio');
var scrape = require('scrape');
var aSync = require('async');
var request = require('request');
var async = require('async');
var smtpTransport = require('nodemailer-smtp-transport');
var ses = require('nodemailer-ses-transport');
var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } )
var S3FS = require('s3fs'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
router.use(multipartyMiddleware); 
var urls1 = [];
var resultAnalysis = require("./externalFunction/resultAnalysis");
require('dotenv').config();
var homeurl = process.env.homeUrl;

var adminController = require('../lib/controller/admin');
var studentController = require('../lib/controller/student');
var placementHeadController = require('../lib/controller/placementHead');

var has = function(container, value) {
	var returnValue = false;
	var pos = container.indexOf(value);
	if (pos >= 0) {
		returnValue = true;
	}
	return returnValue;
}
function remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: "smtp.gmail.com",
    auth: {
        user: 'bkm.blore.c9@gmail.com', // Your email id
        pass: 'cloudnine' // Your password
    }
});
        
// var transporter = nodemailer.createTransport(ses({
//     accessKeyId: 'process.env.MailerKeyid',
//     secretAccessKey: 'process.env.MailerPsd'
// }));


router.get("/",middleware.isAdmin,function(req,res){
    var lengths_users,lengths_students,length_placementHeads=0;
    User.find({}, function (err, users) {
        lengths_users = users.length;
        users.forEach(function(val,index){
            if(val.userType == 'placementHead')
                length_placementHeads++;    
        });
        
        Student.find({}, function (err, studs) {
            lengths_students = studs.length;
            length ={
                user : lengths_users,
                student: lengths_students,
                placement: length_placementHeads
            };
            res.render('admin/home',{lengths:length});
        }); 
    });
    
});

router.get("/upload",function(req,res){
    res.render("admin/upload");
});

router.post("/upload",function(req,res){
    var url;
    var imageFile = req.files.image;
    //     fileExtension1 = imageFile.originalFilename.split(".");
    // var fileExtension = fileExtension1[fileExtension1.length - 1]
    var filename = imageFile.originalFilename;
    var stream = fs.createReadStream(imageFile.path);
    var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'publicImages/'+filename,
        Body: stream
    };
    s3.upload(params, function(err, data) {
        if(err)
            console.log(err);
        else{
            url=data.Location;
            var obj= { link: url }
            res.end(JSON.stringify(obj));
        }
    });
});



router.get("/user_list",middleware.isAdmin,function(req, res) { // is login middleware
    adminController.list(function(list){
        res.render("admin/user_list",{Users:list});
    });    
});

router.get('/students',middleware.isAdminOrPlacement,function(req, res) {
    populate = {
        path: 'author',
        model: 'User'
    };
    selectArray =['author'];
    studentController.listStudents({},selectArray,populate,function(list){
        res.render('admin/student_list',{list:list});        
    }); 
});

router.delete('/students',middleware.isAdminOrPlacement, function(req, res, next) {
    // var usn = req.body.USN || req.query.USN;
    var userID = req.body.userID || req.query.userID;
    console.log(req.body);
    studentController.removeStudent({author:userID},function(data){
        console.log(data);
        req.flash("success","User deleted");
        res.json({success: true});
    });
});



router.post('/users/delete', middleware.isAdminOrPlacement, function(req, res, next) {
    var userID = req.body.userID || req.query.userID;
    User.remove({'_id':userID }, function(err, user) {
        if (err) { 
            res.json({"error": err});
        } else { 
            res.json({success: true});
            req.flash("success","User removed");
        }
    })
});

router.get("/scrapeResults",middleware.isAdmin, function(req,res){
    res.render("result/scrapeResults");
})

router.post("/scrapeResults",middleware.isAdmin,function(req,res){
    var checkCBCS=false;
    function createlinks(){
        console.log("Creating Links");
        if(req.body.sublink.substring(0,4)=='cbcs') checkCBCS=true;
        var fromUSN=parseInt(req.body.fromUSN.substring(7,10));
        var toUSN=parseInt(req.body.toUSN.substring(7,10));
        var department = [];
        (typeof req.body.department === 'string') ? department.push(req.body.department) : department = req.body.department;
        var link = "http://results.vtu.ac.in/"+req.body.sublink+"?usn="+(req.body.fromUSN.substring(0,5));
        var mainurls=[],i,linktopush;
        department.forEach(function(dep){
            for(i=fromUSN;i<=toUSN;i++){
                linktopush=link+dep+("00" + i).slice(-3);
                mainurls.push(linktopush)
            }
        })
        console.log("Links created");
        f1(mainurls,mainurls.length);
    } //Function to create links before scraping
    function getResultStatus(marks,sem,cbcs){
        if(sem==1 || sem==2 ){
            if((parseInt(marks)>=(750*0.7)-5)){
                return "FIRST CLASS WITH DISTINCTION";
            }else if(parseInt(marks)>=(750*0.6)){
                return 'FIRST CLASS';
            }else if(parseInt(marks)>=(750*0.5)){
                return 'SECOND CLASS';
            }else{
                return 'THIRD CLASS';
            }
        }
        else if(sem==8){
            if((parseInt(marks)>=(750*0.7)-5)){
                return "FIRST CLASS WITH DISTINCTION";
            }else if(parseInt(marks)>=(750*0.6)){
                return 'FIRST CLASS';
            }else if(parseInt(marks)>=(750*0.5)){
                return 'SECOND CLASS';
            }else{
                return 'THIRD CLASS';
            }
        }else{
            var tmarks;
            if(cbcs) tmarks= 800;
            else tmarks= 900
            if((parseInt(marks)>=(tmarks*0.7)-5)){
                return "FIRST CLASS WITH DISTINCTION";
            }else if(parseInt(marks)>=(tmarks*0.6)){
                return 'FIRST CLASS';
            }else if(parseInt(marks)>=(tmarks*0.5)){
                return 'SECOND CLASS';
            }else{
                return 'THIRD CLASS';
            }
        }
    }    //Function to get result status based on marks(Ex: FCD,FC,etc)
    var counter = 0;
    function f1(urls,len){
        console.log("Scraping Initiated.....")
        counter = 0;
        var compareLength=urls.length;
        scrape.concurrent(urls,3000, function(url, callback) {
        if(url){
        request(url,async function(error, response, html){
            var usn1 = url.split('usn=')[1];
            if(!error){
                var $ = cheerio.load(html);
                var usn = $('table tr').first().children().eq(1).text().split(': ')[1]; 
                if(usn){
                    var index = urls.indexOf(url);
                    urls.splice(index, 1);
                    var name = $('table tr').eq(1).children().eq(1).text().split(': ')[1];
                    // console.log("Name:",name);
                    var semMarks = [],semMarks2=[],subjectMarks2=[];
                    var dep = usn.substr(5,2);
                    var semsScraped=[],subjectsScraped=[];
                    async function extract(){
                        $('.table').each(function(){
                        var semester = $(this).prev().text().split(': ')[1];
                        semester = parseInt(semester);
                        semsScraped.push(semester);
                        var semTotal = 0;
                        var subjectMarks = [],semResult;
                        subjectsScraped[semester]=[];
                        subjectMarks2[semester]=[];
                        var fail = false,absent=false;
                        $(this).children('tbody').each(function(){
                            var subjectCode = $(this).children().children().first().text();
                            var subjectName = $(this).children().children().eq(1).text();
                            var internalMarks = isNaN($(this).children().children().eq(2).text())
                            ? NaN:parseInt($(this).children().children().eq(2).text());
                            // var internalMarks = 1009;
                            var externalMarks = isNaN($(this).children().children().eq(3).text())
                            ? NaN:parseInt($(this).children().children().eq(3).text());
                            var subjectTotal = isNaN($(this).children().children().eq(4).text())
                            ? NaN:parseInt($(this).children().children().eq(4).text());
                            var subjectResult = $(this).children().children().eq(5).text();
                            var subject = {
                                subjectCode: subjectCode,
                            	subjectName: subjectName,
                            	internalMarks: internalMarks,	
                            	externalMarks: externalMarks,
                            	subTotal: subjectTotal,
                            	subResult: subjectResult
                            }
                            subjectsScraped[semester].push(subjectCode);
                            subjectMarks.push(subject);
                            subjectMarks2[semester][subjectCode]=subject;
                            semTotal = semTotal + parseInt(internalMarks) + parseInt(externalMarks);
                            if(subjectResult=='F'&&(!fail)){
                                fail=true;
                                semResult = 'FAIL'
                            }else if(subjectResult=='A'&&(!fail)&&(!absent)){
                                absent=true;
                                semResult = 'AB'
                            }else if((!fail)&&(!absent)){
                                semResult=getResultStatus(semTotal,semester,checkCBCS);
                            }
                        });
                        // var semTotal = $(this).parent().next().children().first().children().first().children().last().text().split(': ')[1];;
                        // var semResult = $(this).parent().next().children().last().children().last().children().last().text().split(': ')[1];
                        var semesterResult = {
                            sem: semester,
                        	subjects: subjectMarks,
                        	total: semTotal,
                        	result: semResult
                        }
                        semMarks.push(semesterResult);
                        semMarks2[semester]=semesterResult;   //For update: to identify a sem's marks with index as sem
                        // console.log("Sem: ",semMarks2[semester])
                    })
                    }
                    async function update(){
                    VTUmarks.findOne({usn:usn},function(err1,student){
                        var studentResult = {
                            name: name,
                        	usn: usn,
                        	department: dep,
                        	marks:semMarks
                        };
                        if(err1) console.log("Scrape route find student: ",err1);
                        else{
                            // console.log("Initial check",student);
                            if(student===null){
                                // console.log("Im in")
                                VTUmarks.create(studentResult,function(err2,studResult){
                                    if(err2){
                                        console.log("VTU marks create error: ",err2)
                                        remove(urls,url);
                                        counter = counter + 1;
                                        len = len - 1;
                                        if(len<=0&&urls.length<=0){
                                            f2();
                                        }
                                        if(counter>=compareLength){
                                            console.log("Loop Again");
                                             f1(urls,urls.length);
                                        }
                                    }
                                    else{
                                        console.log("Scraped:",usn);
                                        remove(urls,url);
                                        counter = counter + 1;
                                        len = len - 1;
                                        if(counter>=compareLength){
                                            console.log("Loop Again");
                                            f1(urls,urls.length);
                                        }
                                        if(len<=0&&urls.length<=0){
                                            f2();
                                        }
                                    }
                                })
                            }else{
                                console.log("Result Present");
                                VTUmarks.findOne({usn:usn}).distinct('marks.sem', function(error, existingSems) {
                                    if(error)
                                        console.log(error);
                                    else{
                                        var studentMarksToSaveFinally=[];
                                        var stud,scrapedSemCount=0;
                                        if(existingSems.length>0){
                                            // console.log("OK1");
                                            // console.log("length > 0 :",existingSems.length)
                                            async.each(semsScraped,function(sem,callback){
                                                if(!has(existingSems,sem)){
                                                    //console.log("OK2");
                                                    studentMarksToSaveFinally.push(semMarks2[sem]);
                                                    scrapedSemCount+=1;
                                                    if(scrapedSemCount===semsScraped.length){
                                                        remove(urls,url);
                                                        counter = counter + 1;
                                                        len = len - 1;
                                                        if(counter>=compareLength){
                                                            console.log("Loop Again");
                                                            f1(urls,urls.length);
                                                        }
                                                        if(len<=0&&urls.length<=0){
                                                            f2();
                                                        }
                                                        // console.log("Updating: ",usn);
                                                    } 
                                                    else callback();
                                                }else{
                                                    //console.log("OK3 sem exists already");
                                                    var check = true,subjectsToUpdate=[];
                                                    async.each(student.marks, function(eachSemMarks,callback2){
                                                        if(eachSemMarks.sem === sem && check===true){
                                                            // console.log("Sem update: ",sem)
                                                            // console.log("OK4");
                                                            var semTotal2=0,semResult2,fail=false,absent=false;
                                                            async.each(eachSemMarks.subjects, function(subject,callback3){
                                                                semTotal2+=subjectMarks2[sem][subject.subjectCode]['subTotal'];
                                                                var subjectResult = subjectMarks2[sem][subject.subjectCode]['subResult'];
                                                                if(subjectResult=='F'&&(!fail)){
                                                                    fail=true;
                                                                    semResult2 = 'FAIL'
                                                                }else if(subjectResult=='A'&&(!fail)&&(!absent)){
                                                                    absent=true;
                                                                    semResult2 = 'AB'
                                                                }else if((!fail)&&(!absent)){
                                                                    semResult2=getResultStatus(semTotal2,sem,checkCBCS);
                                                                }
                                                                if(has(subjectsScraped[sem],subject.subjectCode)){
                                                                    subjectsToUpdate.push(subjectMarks2[sem][subject.subjectCode]);
                                                                    // console.log("OK5");
                                                                    callback3();
                                                                }else{
                                                                    subjectsToUpdate.push(subject);
                                                                    // console.log("OK6");
                                                                    callback3();
                                                                }
                                                            },function(error1) {
                                                                if(error1) {
                                                                    console.log('A file failed to process 1');
                                                                    // console.log("OK7");
                                                                    callback2();
                                                                } else {
                                                                    semMarks2[sem]={
                                                                        sem: sem,
                                                                    	subjects: subjectsToUpdate,
                                                                    	total: semTotal2,
                                                                    	result: semResult2
                                                                    }
                                                                    studentMarksToSaveFinally.push(semMarks2[sem]);
                                                                    // console.log("OK8");
                                                                    callback2();
                                                                }
                                                            })
                                                        }else{
                                                            // console.log("OK9");
                                                            callback2();
                                                        }
                                                    },function(error2) {
                                                        if(error2) {
                                                          console.log('A file failed to process 2');
                                                        //   console.log("OK13");
                                                          callback();
                                                        } else {
                                                        //   console.log('All files have been processed successfully 2');
                                                        // console.log("OK14");
                                                          callback();
                                                        }
                                                    })
                                                }
                                            }, function(err) {
                                                if( err ) {
                                                  console.log('A file failed to process 3');
                                                } else {
                                                    // console.log('Final Callback');
                                                    console.log("Updated final: ",usn);
                                                    remove(urls,url);
                                                    console.log("URLS left 1: ",urls.length);
                                                    student.marks=studentMarksToSaveFinally;
                                                    student.save(function(errorSave,docSaved){
                                                        if(errorSave){
                                                            console.log("Error final save: ",errorSave)
                                                        }else{
                                                            // console.log("Updated final: ",usn)
                                                            // remove(urls,url);
                                                        }
                                                    })
                                                    counter = counter + 1;
                                                    len = len - 1;
                                                    if(counter>=compareLength&&len<=0){
                                                        f2();
                                                    }else if(counter>=compareLength){
                                                        console.log("Loop Again");
                                                        f1(urls,urls.length);
                                                    }
                                                    // if(len<=0&&urls.length<=0){
                                                    //     f2();
                                                    // }
                                                }
                                            })
                                        }else{
                                            student.marks=semMarks2;
                                            student.save(function(errorSave,docSaved){
                                                if(errorSave){
                                                    console.log("Error final save: ",usn,": ",errorSave)
                                                    remove(urls,url);
                                                    counter = counter + 1;
                                                    len = len - 1;
                                                    if(counter>=compareLength&&len<=0){
                                                        f2();
                                                    }else if(counter>=compareLength){
                                                        console.log("Loop Again");
                                                        f1(urls,urls.length);
                                                    }
                                                }else{
                                                    // console.log("Updated final: ",usn)
                                                    remove(urls,url);
                                                    console.log("URLS left 2: ",urls.length);
                                                    counter = counter + 1;
                                                    len = len - 1;
                                                    if(counter>=compareLength&&len<=0){
                                                        f2();
                                                    }else if(counter>=compareLength){
                                                        console.log("Loop Again");
                                                        f1(urls,urls.length);
                                                    }
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                    }
                    await extract();
                    await update();
                }
                else{
                    // console.log("Doesnt exist: ",usn1);
                    remove(urls,url);
                    console.log("URLS left 3: ",urls.length);
                    counter = counter + 1;
                    len = len - 1;
                    if(counter>=compareLength&&len<=0){
                        f2();
                    }else if(counter>=compareLength){
                        console.log("Loop Again");
                        f1(urls,urls.length);
                    }
                    
                }
            }
            else{
                console.log("Error: ",usn1)
                console.log("URLS left 4: ",urls.length);
                counter = counter + 1;
                if(counter>=compareLength){
                    console.log("Again");
                    f1(urls,urls.length);
                } 
            }
        });
        }
        else{
            console.log("Chill")
            // if(urls.length==0)
            //     f2();
        }
    })
    }
    function f2(){
        console.log("Scraping Done");
        req.flash("success","Scraped");
        res.redirect("/viewResults");
    }
    // f1(urls1);
    createlinks();
});


router.get("/viewScrapedResults/a",function(req,res){
  VTUmarks1.find({'department':'CS'}).exec(function(err,records){
      if(err){
          console.log("Error: ",err);
      }
      else{
           
        //   resultAnalysis(records);
          res.send(resultAnalysis.results(records));
           
      }
  }) 
});


router.get("/addPlacementHead", middleware.isAdmin, function(req, res) {
    res.render("admin/addPlacementHead");
}); 

router.post("/addPlacementHead", middleware.isAdmin, function(req, res){
    placementHeadController.addPlacementHead(req.body,function(addedPLacementHead){
        res.redirect("/verify?authToken="+addedPLacementHead.authToken);
    });
});
router.get('/resetQuestion',function(req,res) {
    adminController.getColleges(function(clgs){
        res.render('admin/resetQuestions',{clgs:clgs});
    });
});



module.exports = router;


