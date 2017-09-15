var express = require("express"),
    router  = express(),
    passport = require("passport"),
    User = require("../models/user"),
    Student = require("../models/student"),
    Placement = require("../models/placement"),
    Book = require("../models/book"),
    LostItems = require("../models/lostItems"),
    FoundItems = require("../models/foundItems"),
    nodemailer = require('nodemailer'),
    middleware = require("../middleware");
var aws = require('aws-sdk');
aws.config.loadFromPath('awscredentials.json');
var s3 = new aws.S3();
var s3Bucket = new aws.S3( { params: {Bucket: 'gradbunker'} } )
var S3FS = require('s3fs'),
    fs = require('fs'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();
router.use(multipartyMiddleware); 

router.get("/",function(req,res){
    res.render("lostNfound/homePage");
});

router.get("/addLostItem",function(req,res){
    var currentUser = req.user;
    if(currentUser){
        res.render("lostNfound/addLost");
    }
    else{
        req.flash("success","Alert! You must be logged in to do this!")
        res.render("lostNfound/lostLogin");     
    }
});

router.post("/addLostItem",function(req,res){
    var mailAttachments = [];
    var length = req.files.images.length;
    var urls = [],count = 1;
    function f1(){
        if(length>0){
            function uploader(i){
                var imageFile = req.files.images[i],
                    fileExtension1 = imageFile.name.split(".");
                var fileExtension = fileExtension1[fileExtension1.length - 1]
                var filename = Date.now()+'image'+i+'.'+fileExtension;
                var stream = fs.createReadStream(imageFile.path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'LostItemUploads/'+filename,
                    Body: stream
                };
                s3.upload(params, function(err, data) {
                    if(err) console.log(err);
                    else{
                        var newAttachment = {
                            filename: filename,
                            path: data.Location
                        }
                        mailAttachments.push(newAttachment);
                        urls.push(data.Location);
                        if(count===length) f2();
                        else{
                            count = count + 1;
                            i = i + 1;
                            uploader(i);
                        }
                  }
                });
            }
            uploader(0);
        }else{
            f2();
        }
    }
    function f2(){
        var newItem = new LostItems({
            author: req.user._id,
            itemName: req.body.itemName,
            lostDate: req.body.lostDate,
            lostPlace: req.body.location1,
            itemSpecifics: req.body.specifics,
            phone: req.body.phoneNum,
            description: req.body.itemDescription,
            imageLinks: urls,
            verified: false
        });
        LostItems.create(newItem,function(error,lostItem){
            if(error){
                console.log(error);
                req.flash("error","Could not add this entry");
                res.redirect("/lostNfound/addLostItem");
            }
            else{
                // req.flash("success","Verify your entry through your mail");
                // res.redirect("/lostNfound");
                var mailOptions;
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    host: "smtp.gmail.com",
                    auth: {
                        user: 'bkm.blore.c9@gmail.com', // Your email id
                        pass: 'cloudnine' // Your password
                    }
                });
                // console.log("Attachments: ",mailAttachments);
                var htmlMail = '<div> <p> Hello '+req.user.firstName+', </p>'+
                '<p> This is a mail from GradBunker.  </p> <p> You added a new listing '+
                'under LOST items. </p><p> Listed Item: '+lostItem.itemName+ '</p><p> '+
                'If you did add this listing, '+
                '<a href="https://erpdontdelete-mkb95.c9users.io/lostNFound/addLostItem/verify?item='+lostItem._id+
                '">click here</a> to verify and add the listing</p>'+
                '<p> If not, Please ignore this mail</p><p> Regards, </p>'+
                '<p> GradBunker</p></div>';
                mailOptions = {
                    from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                    to: 'bkm.blore@gmail.com, '+req.user.email, // list of receivers
                    subject: 'You lost this item?', // Subject line
                    html: htmlMail, //, // plaintext body
                    attachments: mailAttachments
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Message sent: congo!!!!!');
                        req.flash("success","Verification Mail Sent");
                        res.redirect("/lostNfound/viewLostlist");
                        // callback(null,"It works");
                    };
                });
            }
        })
    }
    f1();
});

router.get('/addLostItem/verify', function(req, res) {
    LostItems.findOne({'_id':req.query.item}, function(err, item) {
        if(err) console.log('err:', err);
        else{
            item.verified = true;
            item.save(function(err1,studentInfo){
                if(err1){
                    return console.log(err1)
                }else{
                    req.flash('success', 'Lost item verified and listed');
                    res.redirect("/lostNfound/viewLostlist");
                }
            })
        }
    });
});

router.get("/addFoundItem",function(req,res){
    var currentUser = req.user;
    if(currentUser){
        res.render("lostNfound/addFound");
    }
    else{
        req.flash("success","Alert! You must be logged in to do this!")
        res.render("lostNfound/foundLogin");     
    }
});

router.post("/addFoundItem",function(req,res){
    var mailAttachments = [];
    var length = req.files.images.length;
    var urls = [],count = 1;
    function f1(){
        if(length>0){
            function uploader(i){
                var imageFile = req.files.images[i],
                    fileExtension1 = imageFile.name.split(".");
                var fileExtension = fileExtension1[fileExtension1.length - 1]
                var filename = Date.now()+'image'+i+'.'+fileExtension;
                var stream = fs.createReadStream(imageFile.path);
                var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'FoundItemUploads/'+filename,
                    Body: stream
                };
                s3.upload(params, function(err, data) {
                    if(err) console.log(err);
                    else{
                        var newAttachment = {
                            filename: filename,
                            path: data.Location
                        }
                        mailAttachments.push(newAttachment);
                        urls.push(data.Location);
                        if(count===length) f2();
                        else{
                            count = count + 1;
                            i = i + 1;
                            uploader(i);
                        }
                    //   res.send(data.Location);
                  }
                });
            }
            uploader(0);
        }else{
            f2();
        }
    }
    function f2(){
        var newItem = new FoundItems({
            author: req.user._id,
            itemName: req.body.itemName,
            foundDate: req.body.foundDate,
            foundPlace: req.body.location1,
            itemSpecifics: req.body.specifics,
            phone: req.body.phoneNum,
            description: req.body.itemDescription,
            imageLinks: urls,
            verified: false
        });
        FoundItems.create(newItem,function(error,foundItem){
            if(error){
                console.log(error);
                req.flash("error","Could not add this entry");
                res.redirect("/lostNfound/addFoundItem");
            }
            else{
                // req.flash("success","Verify your entry through your mail");
                // res.redirect("/lostNfound");
                console.log("Found Item",foundItem)
                var mailOptions;
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    host: "smtp.gmail.com",
                    auth: {
                        user: 'bkm.blore.c9@gmail.com', // Your email id
                        pass: 'cloudnine' // Your password
                    }
                });
                // console.log("Attachments: ",mailAttachments);
                var htmlMail = '<div> <p> Hello '+req.user.firstName+', </p>'+
                '<p> This is a mail from GradBunker.  </p> <p> You added a new listing '+
                'under FOUND items. </p><p> Listed Item: '+foundItem.itemName+ '</p><p> '+
                '<p> If you did add this listing, '+
                '<a href="https://erpdontdelete-mkb95.c9users.io/lostNFound/addFoundItem/verify?item='+foundItem._id+
                '">click here</a> to verify and add the listing</p>'+
                '<p> If not, Please ignore this mail</p><p> Regards, </p>'+
                '<p> GradBunker</p></div>';
                mailOptions = {
                    from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                    to: 'bkm.blore@gmail.com, '+req.user.email, // list of receivers
                    subject: 'You found this item?', // Subject line
                    html: htmlMail, //, // plaintext body
                    attachments: mailAttachments
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                    else{
                        console.log('Message sent: congo!!!!!');
                        req.flash("success","Verification Mail Sent");
                        res.redirect("/lostNfound/viewFoundlist");
                        // callback(null,"It works");
                    };
                });
            }
        })
    }
    f1();
});

router.get('/addFoundItem/verify', function(req, res) {
    FoundItems.findOne({'_id':req.query.item}, function(err, item) {
        if(err) console.log('err:', err);
        else{
            item.verified = true;
            item.save(function(err1,studentInfo){
                if(err1){
                    return console.log(err1)
                }else{
                    req.flash('success', 'Found item verified and listed');
                    res.redirect("/lostNfound/viewFoundItems");
                }
            })
        }
    });
});

router.post("/lostLogin",function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            else{
                res.redirect("/lostNfound/addLostItem");
            }
        });
    })(req, res, next);
});

router.post("/foundLogin",function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            else{
                res.redirect("/lostNfound/addFoundItem");
            }
        });
    })(req, res, next);
});

router.get("/viewLostlist",function(req,res){
    LostItems.find({},function(err,items){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewLostlist",{lostItems: items});
        }
    })
})

router.get("/viewFoundlist",function(req,res){
    FoundItems.find({},function(err,items){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewFoundlist",{foundItems: items});
        }
    })
})

router.get("/viewLostItems",function(req,res){
    LostItems.find({'verified':true}).populate('author').exec(function(err,items){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewLost",{Items: items});
        }
    })
})

router.get("/viewItemLost/:id",function(req,res){
    LostItems.findOne({'_id':req.params.id}).populate('author').exec(function(err,item){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewItemLost",{Item: item});
        }
    })
})

router.get("/viewFoundItems",function(req,res){
    FoundItems.find({'verified':true}).populate('author').exec(function(err,items){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewFound",{Items: items});
        }
    })
})

router.get("/viewItemFound/:id",function(req,res){
    FoundItems.findOne({'_id':req.params.id}).populate('author').exec(function(err,item){
        if(err) console.log(err);
        else{
            res.render("lostNfound/viewItemFound",{Item: item});
        }
    })
})
    
module.exports = router;