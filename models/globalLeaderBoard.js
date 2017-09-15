var mongoose = require("mongoose");

var GlobalLeaderSchema = new mongoose.Schema({
    author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
    test:Number,
    xp:Number
});

module.exports = mongoose.model("GlobalLeaderBoard", GlobalLeaderSchema);



