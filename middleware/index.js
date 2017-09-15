var middlewareObj = {};

middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.userType === 'admin'){
            return next();
        } else{
            req.flash("error","You do not have the privilige to access the page!");
            res.redirect("/"+req.user.userType);
            // res.redirect("back");
        }
    }else{
        req.flash("error","Please login to continue");
        req.session.redirectTo = req.originalUrl; 
        delete req.session.returnTo;
        res.redirect("/login");
    }
};
middlewareObj.isPlacementHead = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.userType === 'placementHead'){
            return next();
        } else{
            req.flash("error","You do not have the privilige to access the page!");
            res.redirect("/"+req.user.userType);
            // res.redirect("back");
        }
    }else{
        req.flash("error","Please login to continue");
        req.session.redirectTo = req.originalUrl; 
        delete req.session.returnTo;
        res.redirect("/login");
    }
};

middlewareObj.isStudent = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.userType === 'student'){
            return next();
        } else{
            req.flash("error","You do not have the privilige to access the page!");
            res.redirect("/"+req.user.userType);
            // res.redirect("back");
        }
    }else{
        req.flash("error","Please login to continue");
        req.session.redirectTo = req.originalUrl; 
        delete req.session.returnTo;
        res.redirect("/login");
    }
};
middlewareObj.isAdminOrPlacement = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.userType === 'admin' || req.user.userType === 'placementHead'){
            return next();
        } else{
            req.flash("error","You do not have the privilige to access the page!");
            res.redirect("/"+req.user.userType);
            // res.redirect("back");
        }
    }else{
        req.flash("error","Please login to continue");
        req.session.redirectTo = req.originalUrl; 
        delete req.session.returnTo;
        res.redirect("/login");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
            // if(req.user.userType == 'student')
            // return next();
            // else{
            //     req.flash("error","You dont have the previlage to do this");
            //     // res.redirect("back");
            // }
            return next();
        
    }
    req.flash("error","Please login to continue");
    req.session.redirectTo = req.originalUrl; 
    delete req.session.returnTo;
    // res.redirect("/login/"+req.originalUrl.split('/')[1]);
    res.redirect("/login");
    // res.redirect(req.get("referer"));
};

middlewareObj.notLoggedIn = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    // req.flash("error", "You need to be logged out to do that");
    res.redirect('back');
};

module.exports = middlewareObj;