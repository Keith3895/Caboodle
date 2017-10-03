function(req,res){
    console.log(req.body);
    var eligibility = req.body.tenth+'-'+req.body.twelfth+'-'+req.body.engg;
    var qualification = req.body.qualification;
    var sems=[],deps=[];
    qualification = (typeof qualification === 'string') ? qualification : qualification.join(", ");
    var department = req.body.department;
    department = (typeof department === 'string') ? department : department.join(", ");
    (typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    (typeof req.body.sendTodepartment === 'string') ? deps.push(req.body.sendTodepartment) : deps = req.body.sendTodepartment;
    var emails,students;
    Student.find({ semester: { $in: sems } , department: { $in: deps }}).populate('author').exec(function(err,records){
        if(err) console.log(err);
        else{
            records.forEach(function(record){
                // res.send(records);
                emails = emails + ', '+ record.author.email;
            })
        }
    })
    // console.log()(typeof req.body.semesters === 'string') ? sems.push(req.body.semesters) : sems = req.body.semesters;
    var mailAttachments = [];
    var length = req.files.docs.length;
    var filePaths=[],count = 1;
    uploadData = function f2(){
    var newPlacement = new Placement({
        author: req.user._id,
        cName: req.body.cName,
    	Package: req.body.package,
    	jobLocation: req.body.jobLocation,
    	qualification: qualification,
    	department: department,
    	skills: req.body.skills,
    	designation: req.body.designation,
    	driveLocation: req.body.driveLocation,
    	date: req.body.driveDate,
    	eligibility: eligibility,
    	jobDescription: req.body.jobDescription, 
    	doc_links: filePaths,
    });
    Placement.create(newPlacement,function(error,newDrive){
        if(error){
            console.log(error);
            req.flash("error","Couldnt Update New Drive");
            res.redirect("/placementHead/addNewPlacement");
        }
        else{
            var html;
            // console.log("Created: ",newDrive);
            // req.flash("success","Updated New Drive");
            // res.redirect("/placementHead");
            var mailOptions;
            // console.log("Attachments: ",mailAttachments);
            ejs.renderFile(template,{placement: newDrive}, function(err, html){
                if (err) console.log(err);
                else{
                    mailOptions = {
                        from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                        to: 'bkm.blore@gmail.com '+emails, // list of receivers
                        subject: newDrive.cName+'- New Placement Update', // Subject line
                        html: html, //, // plaintext body
                        attachments: mailAttachments
                    };
                }
            });
            
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                }
                else{
                    console.log('Message sent: congo!!!!!');
                    req.flash("success","Updated Placement Info");
                    res.redirect("/placementHead/list");
                    // callback(null,"It works");
                };
            });
        }
    })
    };
    fileUploader(0,req.files.docs,'PlacementUploads/',length,mailAttachments,filePaths);
});














