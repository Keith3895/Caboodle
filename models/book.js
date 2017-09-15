var mongoose = require("mongoose");

var BookSchema = new mongoose.Schema({
    title: String,
    author: String,
    category: String,
    publicationName: String,
    publishedYear: String,
    edition: String,
    image_link: String,
    codes: [{code:String,status:Boolean,date: String, USN: String, Amount:String,isbn: String}]
});

module.exports = mongoose.model("book", BookSchema);



