var mongoose = require("mongoose");

var leaderSchema = new mongoose.Schema({
    testId: {type: String,unique:true},
    entry: [{
        author:  {
    	     type: mongoose.Schema.Types.ObjectId,
    	     ref: "User"
    	},
    	marks:String,
    	xp:Number
    }]
});

module.exports = mongoose.model("LeaderBoard", leaderSchema);



