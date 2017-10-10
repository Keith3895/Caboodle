var mongoose = require("mongoose");
var QuestionSchema = new mongoose.Schema({
    author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
	department: String
});
module.exports = mongoose.model("Question", QuestionSchema);