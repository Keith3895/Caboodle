var mongoose = require("mongoose");
var passportLocalMongooseEmail = require("passport-local-mongoose-email");

var UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password:  String,
    userType: String,
    gender: String,
    dp: String,
    usn: { type : String , unique : true}
});

UserSchema.pre('save', function(next) {
  if (this.gender === 'Male') {
    this.dp = 'https://gradbunker.s3.ap-south-1.amazonaws.com/publicImages/male2.png';
  } else {
    this.dp = 'https://gradbunker.s3.ap-south-1.amazonaws.com/publicImages/female2.jpg';
  }
  next();
});

UserSchema.plugin(passportLocalMongooseEmail,{
    usernameField: 'email'
});

UserSchema.pre('remove', function(next) {
  console.log("in Pre");
    this.model('Student').remove({ author: this._id },
    function(err){
      if(!err) console.log("Removed from student") 
      else console.log(err);
    });
    this.model('GlobalLeaderBoard').remove({ author: this._id },
    function(err){
      if(!err) console.log("Removed from GlobalLeaderBoard") 
      else console.log(err);
    });
    this.model('foundItems').remove({ author: this._id },
    function(err){
      if(!err) console.log("Removed from foundItems") 
      else console.log(err);
    });
    this.model('lostItems').remove({ author: this._id },
    function(err){
      if(!err) console.log("Removed from lostItems") 
      else console.log(err);
    });
    this.model('sellItems').remove({ author: this._id },
    function(err){
      if(!err) console.log("Removed from sellItems") 
      else console.log(err);
    });
    next();
});

module.exports = mongoose.model("User", UserSchema);