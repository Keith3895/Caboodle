var express = require("express"),
    router  = express(),
    passport = require("passport"),
    User = require("../models/user"),
    Student = require("../models/student"),
    Placement = require("../models/placement"),
    Book = require("../models/book"),
    nodemailer = require('nodemailer'),
    middleware = require("../middleware");
var path = require('path'),
    fs = require('fs');
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
    res.render("library/homePage");
});

router.get("/addBook",function(req,res){
    res.render("library/addBook");
});

router.post("/addBook",function(req,res){
    var pathToStore = null;
    Book.findOne({'title':{ '$regex': new RegExp("^" + req.body.title + "$", "i") },
        'author': { '$regex': new RegExp("^" + req.body.author + "$", "i") },
        'publicationName': { '$regex': new RegExp("^" + req.body.publicationName + "$", "i") },
        'publishedYear': { '$regex': new RegExp("^" + req.body.publishedYear + "$", "i") },
        'edition': { '$regex': new RegExp("^" + req.body.edition + "$", "i") }
    },function(err,book){
        if(err){
            console.log(err);
        }
        else{
            if(book!==null){
                console.log("Found");
                var codes = book.codes;
                codes.push({code: req.body.code, status:true, isbn: req.body.isbn });
                book.codes = codes;
                book.save(function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(book);
                        req.flash("success","Book Added");
                        res.redirect("/library/viewBooks");
                    }
                })
            }
            else{
                console.log("Didnt Find the book");
                 if(req.files.coverImage.originalFilename!==''){
                    var bookImage = req.files.coverImage,
                        fileExtension1 = bookImage.name.split(".");
                    var fileExtension = fileExtension1[fileExtension1.length - 1]
                    var filename = req.body.code+'.'+fileExtension;
                    var stream = fs.createReadStream(bookImage.path);
                    var params = {ACL: "public-read", Bucket: 'gradbunker', Key: 'BookImages/'+filename,
                        Body: stream
                    };
                    s3.upload(params, function(err, data) {
                      if(err) console.log(err);
                      else{
                        pathToStore = data.Location;
                        console.log("file uploaded");
                            var newBook= new Book({
                                title: req.body.title,
                                author: req.body.author,
                                category: req.body.category,
                                publicationName: req.body.publicationName,
                                publishedYear: req.body.publishedYear,
                                edition: req.body.edition,
                                image_link: pathToStore,
                                codes: [{code: req.body.code, status:true, isbn: req.body.isbn}]
                            });
                            Book.create(newBook,function(err,bookInfo){
                               if(err){
                                   res.render("./library/addBook");
                               } 
                               else{
                                    req.flash("success","Book Added");
                                    res.redirect("/library/viewBooks");
                               }
                            })
                      }
                    });
                 }
            }
        }
    })
});

router.get("/viewBooks",function(req,res){
    Book.find({}).sort('category').exec(function(err,allBooks){
       if(err){
           console.log("error occured");
       }
       else{
           res.render("./library/viewBooks",{books: allBooks}); 
       }
   });
});
router.get("/view/:category",function(req,res){
    Book.find({'category':{ '$regex': new RegExp( req.params.category, "i") }}).sort('title').exec(function(err,allBooks){
       if(err){
           console.log("error occured");
       }
       else{
           res.render("./library/ViewBooks",{books: allBooks,category:req.params.category}); 
       }
   });
});
router.get("/viewBooks1",function(req,res){
    Book.find({}).sort('category').exec(function(err,allBooks){
       if(err){
           console.log("error occured");
       }
       else{
           res.send(allBooks);
       }
   });
});
    
module.exports = router;