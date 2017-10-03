var mongoose = require("mongoose");
var ContextSchema = new mongoose.Schema({
    context:String,
    type: String,
    marks: String,
    frequency:Number,
    questions:[
        {
            question:String,
            choices:[String],
            correctAnswer:String,
            marks:String,
            solution: String,
        }
        ]
});
module.exports = mongoose.model("Context", ContextSchema);