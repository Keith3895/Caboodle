var mongoose = require("mongoose");
var QuestionSchema = new mongoose.Schema({
    question: String,
    choices: [String],
    correctAnswer: String,
    type: String,
    marks: String,
    solution: String,
    images: [String],
    frequency:Number,
    timestamp:String,
    college:String
});
module.exports = mongoose.model("Question", QuestionSchema);