var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var VTUmarks1 = require("../models/marks2");
var Student = require("../models/student");
var middleware = require("../middleware");
var Placement = require("../models/placement");
var Internship = require("../models/internship");
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

for(var i= 57;i<58;i++){
    urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1KG13CV"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13ME"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13EC"+("00" + i).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13IS"+("00" + i).slice(-3))
}
for(var j= 1;j<=180;j++){
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13CS"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13ME"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13EC"+("00" + j).slice(-3))
    // urls1.push("http://results.vtu.ac.in/results/result_page.php?usn=1AM13IS"+("00" + j).slice(-3))
}

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
})

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
})



router.get("/user_list",middleware.isAdminOrPlacement,function(req, res) { // is login middleware
    // req.session.redirectTo = "/admin/user_list";
    User.find({}, function (err, users) {
        res.render("admin/user_list",{Users:users});
    });
    
});

router.get('/students',middleware.isAdminOrPlacement,function(req, res) {
    Student.find({}).populate({
        path: 'author',
        model: 'User'
    }).exec(function(err,studs){
        res.render('admin/student_list',{list:studs});        
    });
});

router.delete('/students',middleware.isAdminOrPlacement, function(req, res, next) {
    var usn = req.body.USN || req.query.USN;
    var userID = req.body.userID || req.query.userID;
    //include leaderboard
    User.findOne({_id:userID }, function(err, user) {
        if (err) { 
            console.log("User delete error: ",err);
        } else { 
            async.parallel([
                function(callback) {
                    Placement.find({},function(err1,placements){
                        if(err) console.log("Internship delete error: ",err1)
                        else{
                            if(placements!==null){
                                placements.forEach(function(placement){
                                    if(has(placement.registeredStudents,user._id)){
                                        remove(placement.registeredStudents,user._id);
                                        placement.save();
                                    }
                                    if(has(placement.selectedStudents,user._id)){
                                        remove(placement.selectedStudents,user._id);
                                        placement.save();
                                    }
                                })
                            }
                        }
                    })
                    callback(null,true)
                },
                function(callback) {
                    Internship.find({},function(err1,internships){
                        if(err) console.log("Internship delete error: ",err1)
                        else{
                            if(internships!==null){
                                internships.forEach(function(internship){
                                    if(has(internship.registeredStudents,user._id)){
                                        remove(internship.registeredStudents,user._id);
                                        internship.save();
                                    }
                                    if(has(internship.selectedStudents,user._id)){
                                        remove(internship.selectedStudents,user._id);
                                        internship.save();;
                                    }
                                })
                            }
                        }
                    })
                    callback(null,true)
                }
            ], function(err3, results) {
                console.log("Heretop")
                if (!err3){
                    user.remove().then(function(err4){
                        if(!err4){
                            console.log("Here")
                            req.flash("success","User deleted");
                            // res.redirect("/admin/students")
                        }
                    })
                }
                // something went wrong
             });
            
       }
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


router.get("/scrapeResults",function(req,res){
    for(var i= 1;i<10;i++){
        urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1KG13CV"+("00" + i).slice(-3))
        // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13ME"+("00" + i).slice(-3))
        // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13EC"+("00" + i).slice(-3))
        // urls1.push("http://results.vtu.ac.in/results17/result_page.php?usn=1AM13IS"+("00" + i).slice(-3))
    }
    function getResultStatus(marks,sem){
        if(sem==1 || sem==2 ){
            if((parseInt(marks)>=(775*0.7)-5)){
                return "FIRST CLASS WITH DISTINCTION";
            }else if(parseInt(marks)>=(775*0.6)){
                return 'FIRST CLASS';
            }else if(parseInt(marks)>=(775*0.5)){
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
            if((parseInt(marks)>=(900*0.7)-5)){
                return "FIRST CLASS WITH DISTINCTION";
            }else if(parseInt(marks)>=(900*0.6)){
                return 'FIRST CLASS';
            }else if(parseInt(marks)>=(900*0.5)){
                return 'SECOND CLASS';
            }else{
                return 'THIRD CLASS';
            }
        }
    }
    console.log("Scraping Initiated.....")
    var counter = 0;
    function f1(urls,len){
        counter = 0;
    scrape.concurrent(urls,100, function(url, callback) {
        if(url){
        request(url, function(error, response, html){
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
                    $('.table').each(function(){
                        var semester = $(this).prev().text().split(': ')[1];
                        semester = parseInt(semester);
                        semsScraped.push(semester);
                        var semTotal = 0;
                        var subjectMarks = [],semResult;
                        subjectsScraped[semester]=[];
                        subjectMarks2[semester]=[];
                        $(this).children('tbody').each(function(){
                            var subjectCode = $(this).children().children().first().text();
                            var subjectName = $(this).children().children().eq(1).text();
                            // var internalMarks = isNaN($(this).children().children().eq(2).text())
                            // ? NaN:$(this).children().children().eq(2).text();
                            var internalMarks = 1000;
                            var externalMarks = isNaN($(this).children().children().eq(3).text())
                            ? NaN:$(this).children().children().eq(3).text();
                            var subjectTotal = $(this).children().children().eq(4).text();
                            var subjectResult = $(this).children().children().eq(5).text();
                            var subject = {
                                subjectCode: subjectCode,
                            	subjectName: subjectName,
                            	internalMarks: 1000,	
                            	externalMarks: externalMarks,
                            	subTotal: subjectTotal,
                            	subResult: subjectResult
                            }
                            subjectsScraped[semester].push(subjectCode);
                            subjectMarks.push(subject);
                            subjectMarks2[semester][subjectCode]=subject;
                            semTotal = semTotal + parseInt(internalMarks) + parseInt(externalMarks);
                            if(subjectResult=='F'){
                                semResult = 'FAIL'
                            }else if(subjectResult=='A'&&subjectResult!='F'){
                                semResult = 'AB'
                            }else if(subjectResult!='A'&&subjectResult!='F'){
                                semResult=getResultStatus(semTotal,semester);
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
                    })
                    // console.log("Dep:",dep);
                    // var studentResult = new VTUmarks({
                    //     name: name,
                    // 	usn: usn,
                    // 	department: dep,
                    // 	marks:semMarks
                    // });
                    var studentResult = {
                        name: name,
                    	usn: usn,
                    	department: dep,
                    	marks:semMarks
                    };
                    // res.send(studentResult);
                    // console.log("Scraped:",usn);
                    VTUmarks.findOne({usn:usn},function(err1,student){
                        if(err1) console.log("Scrape route find student: ",err1);
                        else{
                            // console.log("Initial check",student);
                            if(student===null){
                                console.log("Im in")
                                VTUmarks.create(studentResult,function(err2,studResult){
                                    if(err2){
                                        console.log("VTU marks create error: ",err2)
                                        remove(urls,url);
                                        counter = counter + 1;
                                        len = len - 1;
                                        if(len<=0&&urls.length<=0){
                                            f2();
                                        }
                                        if(counter>=100){
                                            // console.log("Again");
                                             f1(urls,urls.length);
                                        }
                                    }
                                    else{
                                        console.log("Scraped:",usn);
                                        remove(urls,url);
                                        counter = counter + 1;
                                        len = len - 1;
                                        console.log("blaaaah")
                                        // res.send(studResult)
                                        if(counter>=100){
                                            // console.log("Again");
                                            f1(urls,urls.length);
                                        }
                                        if(len<=0&&urls.length<=0){
                                            f2();
                                        }
                                    }
                                })
                            }else{
                                console.log("Result Present");
                                VTUmarks.find().distinct('marks.sem', function(error, existingSems) {
                                    if(error)
                                        console.log(error);
                                    else{
                                        console.log("Sem scraped: ",semsScraped)
                                        var stud;
                                        if(existingSems.length>0){
                                            console.log("length > 0 :",existingSems.length)
                                            async.each(semsScraped,function(sem,callback){
                                                if(!has(existingSems,sem)){
                                                    console.log("doesnt hav")
                                                    VTUmarks.findOne({usn:usn},{$addToSet:{marks:semMarks2[sem]}},function(error2,studMarks){
                                                        if(error2){
                                                            console.log("Error2: ",error2)
                                                            var index = urls.indexOf(url);
                                                            if (index > -1) {
                                                                urls.splice(index, 1);
                                                            }
                                                            counter = counter + 1;
                                                            len = len - 1;
                                                            if(len<=0&&urls.length<=0){
                                                                f2();
                                                            }
                                                            if(counter>=100){
                                                                // console.log("Again");
                                                                 f1(urls,urls.length);
                                                            }
                                                            callback();
                                                        }
                                                        else{
                                                            console.log("Scraped:",usn);
                                                            remove(urls,url)
                                                            counter = counter + 1;
                                                            len = len - 1;
                                                            if(counter>=100){
                                                                // console.log("Again");
                                                                f1(urls,urls.length);
                                                            }
                                                            if(len<=0&&urls.length<=0){
                                                                f2();
                                                            }
                                                            callback();
                                                        }
                                                    })
                                                }else{
                                                    // res.send("Sems exist")
                                                    VTUmarks.findOne({'usn':usn})
                                                    .exec(function(error, student) {
                                                        if(error)
                                                            console.log(error)
                                                        else{
                                                            var studentMarksss;
                                                            student.marks.sort(function(a, b) {
                                                                return parseFloat(a.sem) - parseFloat(b.sem);
                                                            });
                                                            var check = true;
                                                            studentMarksss= student.marks;
                                                            async.each(student.marks, function(semsMarks,callback2){
                                                                // console.log("count: ",i)
                                                                if(semsMarks.sem === sem && check===true){
                                                                    check=false;
                                                                    remove(studentMarksss,semsMarks);
                                                                    var sMarks=semsMarks.subjects;
                                                                    var countCheck = 0;
                                                                    semsMarks.subjects.forEach(function(subject){
                                                                        if(has(subjectsScraped[semsMarks.sem],subject.subjectCode)){
                                                                            remove(sMarks,subject);
                                                                            sMarks.push(subjectMarks2[semsMarks.sem][subject.subjectCode])
                                                                            countCheck+=1;
                                                                            if(countCheck===semMarks.subjects.length){ 
                                                                                semMarks2[sem]['subjects']=sMarks;
                                                                                studentMarksss.push(semMarks2[sem]);
                                                                                callback2();
                                                                            };
                                                                        }else{
                                                                            sMarks.push(subjectMarks2[semsMarks.sem][subject.subjectCode])
                                                                            countCheck+=1;
                                                                            if(countCheck===semMarks.subjects.length){ 
                                                                                semMarks2[sem]['subjects']=sMarks;
                                                                                studentMarksss.push(semMarks2[sem]);
                                                                                callback2();
                                                                            };
                                                                        }
                                                                    })
                                                                    // console.log("sMarks after ",sMarks);
                                                                    
                                                                    // console.log("studentMarksssssss after ",studentMarksss)
                                                                }
                                                                // console.log("Sem Marks ",i,sMarks);
                                                                // VTUmarks.update(
                                                                //   {usn:usn, 'marks.sem': semsMarks.sem },
                                                                //   { $set: { "marks.sem.$.subjects" : sMarks } }
                                                                // ).exec(function(error3,updatedResult){
                                                                //     if(error3) console.log(error3);
                                                                //     else{
                                                                //         console.log("Updated result: ",updatedResult)
                                                                //     }
                                                                // })
                                                            }, function(erro) {
                                                                if( erro ) {
                                                                  console.log('A file failed to process');
                                                                } else {
                                                                  console.log('All files have been processed successfully');
                                                                }
                                                            })
                                                            // console.log("Studddmarkss: ",studentMarksss)
                                                            console.log("Stud id: ",student._id)
                                                            VTUmarks.findOneAndUpdate({usn: usn}, 
                                                            {$set:{'marks':studentMarksss}}, {new: true}, function(err, doc){
                                                                if(err){
                                                                    console.log("Something wrong when updating data!");
                                                                }
                                                            
                                                                // console.log("Updated doc: ",doc);
                                                            });
                                                        }
                                                    })
                                                }
                                            }, function(err) {
                                                if( err ) {
                                                  console.log('A file failed to process');
                                                } else {
                                                  console.log('All files have been processed successfully');
                                                }
                                            })
                                        }else{
                                            res.send(stud)
                                        }
                                    }
                                })
                                // res.send(student);
                                // VTUmarks.findOneAndUpdate({usn: usn,'marks.sem':{$in:[2,3,4]}},{$addToSet:{marks:{$each: semMarks}}},{new:true,upsert:true},function(err3,updatedStudResult){
                                //     if(err3){
                                //         console.log("Error3: ",err3)
                                //         var index = urls.indexOf(url);
                                //         if (index > -1) {
                                //             urls.splice(index, 1);
                                //         }
                                //         counter = counter + 1;
                                //         len = len - 1;
                                //         if(len<=0&&urls.length<=0){
                                //             f2();
                                //         }
                                //         if(counter>=100){
                                //             // console.log("Again");
                                //              f1(urls,urls.length);
                                //         }
                                        
                                //     }
                                //     else{
                                //         console.log("Scraped:",usn);
                                //         var index = urls.indexOf(url);
                                //         if (index > -1) {
                                //             urls.splice(index, 1);
                                //         }
                                //         counter = counter + 1;
                                //         VTUmarks.findOne({usn:usn},function(err4,updatedStudent){
                                //             if(err4) console.log(err4);
                                //             else{
                                //                 console.log("Updated")
                                //                 res.send(updatedStudent)
                                //             }
                                //         })
                                //         len = len - 1;
                                //         if(counter>=100){
                                //             // console.log("Again");
                                //             f1(urls,urls.length);
                                //         }
                                //         if(len<=0&&urls.length<=0){
                                //             f2();
                                //         }
                                //     }
                                // })
                            }
                        }
                    })
                }
                else{
                    // console.log("Doesnt exist: ",usn1);
                    var index = urls.indexOf(url);
                    if (index > -1) {
                        urls.splice(index, 1);
                    }
                    counter = counter + 1;
                    len = len - 1;
                    if(len<=0&&urls.length<=0){
                        f2();
                    }
                    if(counter>=100){ 
                        // console.log("Again");
                        f1(urls,urls.length)
                    };
                    
                }
            }
            else{
                console.log("Error: ",usn1)
                counter = counter + 1;
                if(counter>=100){
                    console.log("Again");
                    f1(urls,urls.length);
                } 
            }
        });
        }
        else{
            console.log("Chill")
        }
    })
    }
    function f2(){
        console.log("Scraping Done");
        req.flash("success","Scraped");
        res.redirect("/viewResults");
    }
    f1(urls1);
});


router.get("/scrapeResults_bkp", middleware.isAdmin, function(req,res){
    // req.flash("success","Scrape Request initiated");
    // res.redirect("/")
    console.log("Scraping Initiated.....")
    var counter = 0;
    function f1(urls,len){
        counter = 0;
    scrape.concurrent(urls,100, function(url, callback) {
        if(url){
        request(url, function(error, response, html){
            var usn1 = url.split('usn=')[1];
            if(!error){
                var $ = cheerio.load(html);
                var usn = $('table tr').first().children().eq(1).text().split(': ')[1]; 
                if(usn){
                    var index = urls.indexOf(url);
                    urls.splice(index, 1);
                    var name = $('table tr').eq(1).children().eq(1).text().split(': ')[1];
                    // console.log("Name:",name);
                    var semMarks = [];
                    var dep = usn.substr(5,2);
                    $('.table').each(function(){
                        var semester = $(this).prev().text().split(': ')[1];
                        semester = parseInt(semester);
                        var subjectMarks = [];
                        $(this).children('tbody').each(function(){
                            var subjectCode = $(this).children().children().first().text();
                            var subjectName = $(this).children().children().eq(1).text();
                            var internalMarks = $(this).children().children().eq(2).text();
                            var externalMarks = $(this).children().children().eq(3).text();
                            var subjectTotal = $(this).children().children().eq(4).text();
                            var subjectResult = $(this).children().children().eq(5).text();
                            var subjects = {
                                subjectCode: subjectCode,
                            	subjectName: subjectName,
                            	internalMarks: internalMarks,	
                            	externalMarks: externalMarks,
                            	subTotal: subjectTotal,
                            	subResult: subjectResult
                            }
                            subjectMarks.push(subjects);
                        });
                        var semTotal = $(this).parent().next().children().first().children().first().children().last().text().split(': ')[1];;
                        var semResult = $(this).parent().next().children().last().children().last().children().last().text().split(': ')[1];
                        var semesterResult = {
                            sem: semester,
                        	subjects: subjectMarks,
                        	total: semTotal,
                        	result: semResult
                        }
                        semMarks.push(semesterResult);
                    })
                    // console.log("Dep:",dep);
                    // var studentResult = new VTUmarks({
                    //     name: name,
                    // 	usn: usn,
                    // 	department: dep,
                    // 	marks:semMarks
                    // });
                    var studentResult = {
                        name: name,
                    	usn: usn,
                    	department: dep,
                    	marks:semMarks
                    };
                    // console.log("Scraped:",usn);
                    VTUmarks.update({usn: usn},{$push:{marks:{$each: semMarks}}},{new:true,upsert:true},function(err1,studResult){
                        if(err1){
                            console.log("Error1: ",err1)
                            var index = urls.indexOf(url);
                            if (index > -1) {
                                urls.splice(index, 1);
                            }
                            counter = counter + 1;
                            len = len - 1;
                            if(len<=0&&urls.length<=0){
                                f2();
                            }
                            if(counter>=100){
                                // console.log("Again");
                                 f1(urls,urls.length);
                            }
                            
                        }
                        else{
                            console.log("Scraped:",usn);
                            var index = urls.indexOf(url);
                            if (index > -1) {
                                urls.splice(index, 1);
                            }
                            counter = counter + 1;
                            len = len - 1;
                            if(counter>=100){
                                // console.log("Again");
                                f1(urls,urls.length);
                            }
                            if(len<=0&&urls.length<=0){
                                f2();
                            }
                        }
                    })
                }
                else{
                    // console.log("Doesnt exist: ",usn1);
                    var index = urls.indexOf(url);
                    if (index > -1) {
                        urls.splice(index, 1);
                    }
                    counter = counter + 1;
                    len = len - 1;
                    if(len<=0&&urls.length<=0){
                        f2();
                    }
                    if(counter>=100){ 
                        // console.log("Again");
                        f1(urls,urls.length)
                    };
                    
                }
            }
            else{
                console.log("Error: ",usn1)
                counter = counter + 1;
                if(counter>=100){
                    console.log("Again");
                    f1(urls,urls.length);
                } 
            }
        });
        }
        else{
            console.log("Chill")
        }
    })
    }
    function f2(){
        console.log("Scraping Done");
        req.flash("success","Scraped");
        res.redirect("/viewResults");
    }
    f1(urls1);
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


//handle sign up logic
router.post("/addPlacementHead", middleware.isAdmin, function(req, res){
    var newUser = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userType: "placementHead",
        usn:"placementHead"
    });
    User.register(newUser, 'amcec', function(err, user){
        if(err){
            console.log("error: ",err)
            req.flash("error", err.message);
            return res.render("admin/addPlacementHead");
        }
        var text = 'Hello Admin,\n'+
                    '   This is a mail from GradBunker.\n'+
                    '   You added a new Placement Head ' + user.firstName+
                    '. If you did not add the Placement Head, click the '+
                    'following link to delete the account: '+
                    ''+homeurl+'/delete/'+
                    user._id+'  \n'+
                    '   Else Ignore this mail';
        var mailOptions = {
            from: 'GradBunker <noreply@keithfranklin.xyz>', // sender address
            to: 'bkm.blore@gmail.com', // list of receivers
            subject: 'You recently added a Placement Head', // Subject line
            text: text //, // plaintext body
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log('Message sent: congo!!!!!');
                res.redirect("/verify?authToken="+user.authToken)
            };
        });
    });
});


module.exports = router;








