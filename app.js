var express             = require("express"),
    app                 = express(),
    expressValidator    = require("express-validator"),
    bodyParser          = require("body-parser"),
    methodOverride      = require("method-override"),
    expressSanitizer    = require("express-sanitizer"),
    mongoose            = require("mongoose"),
    path                = require('path'),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    User                = require("./models/user"),
    aws                 = require("aws-sdk"),
    // seedDB              = require("./seeds"),
    cookieParser        = require('cookie-parser'),
    flash               = require('connect-flash'),
    session             = require('express-session'),
    sassMiddleware      = require('node-sass-middleware'),
    upload              = require('express-fileupload');
    var logime          = require('log-timestamp');


//****************************************************
// route  variable declaration
//****************************************************
var middleware = require("./middleware");
var indexRoutes      = require("./routes/index"),
    adminRoutes      = require("./routes/admin"),
    placementRoutes  = require("./routes/placement"),
    studentRoutes    = require("./routes/student"),
    // libraryRoutes     = require("./routes/library"),
    sellRoutes     = require("./routes/buyNsell"),
    lostNfoundRoutes     = require("./routes/lostNfound"),
    testsRoutes     = require("./routes/tests"),
    leaderRoutes    = require("./routes/leaderBoard");

// =======================================
// db connectins and body parsing
// =======================================
mongoose.Promise = global.Promise;
// mongoose.connection.openUri("mongodb://localhost/GradBunker");     // local mongo db
mongoose.connection.openUri("mongodb://admin:learningpwd@13.126.66.202/GradBunker");     // AWS mongo db


app.set("view engine","ejs");

// app.use(upload());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());
app.use(expressSanitizer());
app.use(methodOverride("_method"));
// app.use(session({ secret: 'session secret key' }));
// seedDB();
// =======================================
app.use(session({
    secret: "GradBunker is a college project",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 10*60*1000
    // secure: true
    },
    rolling: true
}));

aws.config.update({
    secretAccessKey: 'fveJNKJOK5FHnst1Pcp+/XGNRHB0AC55Cl7CM8x4',
    accessKeyId: 'AKIAJV56NPSGEK3THCZQ',
    region: 'ap-south-1'
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(
     sassMiddleware({
         src: __dirname + '/node_modules/materialize-sass/sass', 
         dest: __dirname + '/public/stylesheets',
         prefix:  '/stylesheets',
         debug: false,         
     })
  ); 

app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   res.locals.popup =req.flash("popup");
   next();
});

// ========================
// all the requests
// ========================

app.use("/", indexRoutes);
app.use("/admin", adminRoutes);
app.use("/placementHead",/*middleware.isPlacementHead,*/ placementRoutes);
app.use("/student",middleware.isStudent, studentRoutes);
// app.use("/library",libraryRoutes);
app.use("/lostNfound",lostNfoundRoutes);
app.use("/sell",sellRoutes);
app.use("/test",testsRoutes);
app.use("/leader",leaderRoutes);

app.get("*",function(req, res) {            // default route
    res.render("website_under_construction");
});

// function (req, res, next) {
//     if ('HEAD' == req.method || 'OPTIONS' == req.method) return next();
//     // break session hash / force express to spit out a new cookie once per second at most
//     req.session._garbage = Date();
//     req.session.touch();
//     next();
// }

//the listener functions that is used to establish the connection
process.env.PORT = 8080; //AWS 
app.listen(process.env.PORT, function(){ //AWS
// app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started!!!");
});