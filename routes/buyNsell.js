var express = require("express"),
    router  = express(),
    passport = require("passport"),
    User = require("../models/user"),
    Student = require("../models/student"),
    Placement = require("../models/placement"),
    Book = require("../models/book"),
    LostItems = require("../models/lostItems"),
    FoundItems = require("../models/foundItems"),
    SellItems = require("../models/sellItem"),
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
    res.render("sell/homePage");
});

router.get("/addItem",function(req,res){
    var currentUser = req.user;
    if(currentUser){
        res.render("sell/addItem");
    }
    else{
        req.flash("success","Alert! You must be logged in to do this!")
        res.render("sell/sellLogin");     
    }
});

router.post("/sellLogin",function(req,res,next){
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            else{
                res.redirect("/sell/addItem");
            }
        });
    })(req, res, next);
});

router.post("/addItem",function(req,res){
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
                var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'SellItemUploads/'+filename,
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
        var newItem = new SellItems({
            author: req.user._id,
            itemName: req.body.itemName,
            DatePosted: today,
            type: req.body.itemType,
            itemSpecifics: req.body.specifics,
            itemAge: req.body.age,
            phone: req.body.phoneNum,
            price: req.body.price,
            description: req.body.itemDescription,
            imageLinks: urls,
            verified: false
        });
        SellItems.create(newItem,function(error,sellItem){
            if(error){
                console.log(error);
                req.flash("error","Could not add this entry");
                res.redirect("/sell/addItem");
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
                'to sell item. </p><p> Listed Item: '+sellItem.itemName+ '</p><p> '+
                'If you did add this listing, '+
                '<a href="https://erpdontdelete-mkb95.c9users.io/sell/addItem/verify?item='+sellItem._id+
                '">click here</a> to verify and add the listing</p>'+
                '<p> If not, Please ignore this mail</p><p> Regards, </p>'+
                '<p> GradBunker</p></div>';
                mailOptions = {
                    from: 'GradBunker <bkm.blore.c9@gmail.com>', // sender address
                    to: 'bkm.blore@gmail.com, '+req.user.email, // list of receivers
                    subject: 'You want to sell/giveaway this item?', // Subject line
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
                        res.redirect("/sell/viewItemlist");
                        // callback(null,"It works");
                    };
                });
            }
        })
    }
    f1();
});

router.get('/addItem/verify', function(req, res) {
    SellItems.findOne({'_id':req.query.item}, function(err, item) {
        if(err) console.log('err:', err);
        else{
            item.verified = true;
            item.save(function(err1,itemInfo){
                if(err1){
                    return console.log(err1)
                }else{
                    req.flash('success', 'Item verified and listed');
                    res.redirect("/sell/viewItems");
                }
            })
        }
    });
});


router.get("/viewItemlist",function(req,res){
    SellItems.find({},function(err,items){
        if(err) console.log(err);
        else{
            res.render("sell/viewItemlist",{Items: items});
        }
    })
})

router.get("/viewItems",function(req,res){
    SellItems.find({}).populate('author').exec(function(err,items){
        if(err) console.log(err);
        else{
            res.render("sell/viewItems",{Items: items});
        }
    })
})

router.get("/viewItem/:id",function(req,res){
    SellItems.findOne({'_id':req.params.id}).populate('author').exec(function(err,item){
        if(err) console.log(err);
        else{
            res.render("sell/viewItem",{Item: item});
        }
    })
})
    
module.exports = router;