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
    usn: String
});

UserSchema.pre('save', function(next) {
  if (this.gender === 'Male') {
    this.dp = '/images/male2.png';
  } else {
    this.dp = '/images/female2.jpg';
  }
  next();
});

UserSchema.plugin(passportLocalMongooseEmail,{
    usernameField: 'email'
});

module.exports = mongoose.model("User", UserSchema);