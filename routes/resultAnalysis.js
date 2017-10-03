var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var VTUmarks1 = require("../models/marks2");
var Student = require("../models/student");
var middleware = require("../middleware");


router.get('/',function(req,res){
    VTUmarks.find({},function(err,marks){
        res.send(marks);
    });
})

module.exports= router;