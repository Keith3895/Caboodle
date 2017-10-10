var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var VTUmarks = require("../models/vtuMarks");
var VTUmarks1 = require("../models/marks2");
var Student = require("../models/student");
var middleware = require("../middleware");
var ResultsFunc = require("./externalFunction/AnalysisResults");

router.get('/',async function(req,res){
        var da={
            all:await ResultsFunc.PassOrFail('ALL'),
            ty:await ResultsFunc.ResultTypes('ALL'),
            tyAll:await ResultsFunc.ResultTypes('ME'),
        subs: await ResultsFunc.SubjectPassVsFail(),
        dept:await ResultsFunc.PassOrFail('me')
            
        };
        res.send(da);
});
router.get('/typeAll',function(req, res) {
    
    VTUmarks.distinct('department',async function(err,dept){
        var datasend={};
        datasend['All'] = await ResultsFunc.ResultTypes('ALL');
        for(i=0;i<dept.length;i++){
            datasend[dept[i]]= await ResultsFunc.ResultTypes(dept[i]);
        }
        res.send(datasend);
        
    });
    
});
router.get('/all',function(req, res) {
    
    // VTUmarks.count({'marks.result':/fail/i},function(err,c){
    //     res.send(""+c);
    // });
    VTUmarks.aggregate([
        { $unwind: "$marks" },
        { $match: {
                'department': {$regex: /me/i},
                'marks.sem': 8
            }},
        {
            $group: {
                _id: '$marks.result',  //$region is the column name in collection
                count: {$sum: 1}
            }
        }
    ]).exec( function (err, result) {
        if (err) {
            // next(err);
        } else {
            res.send(result);
        }
    });
    
    
});
router.get('/g',function(req,res){
    res.render('HOD/graphs.ejs');
});
module.exports= router;