var mongoose = require("mongoose");

var foundSchema = new mongoose.Schema({
    author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
    itemName: String,
    foundDate: String,
    foundPlace: String,
    itemSpecifics: String,
    phone: Number,
    description: String,
    imageLinks: [String],
    verified: Boolean
});

module.exports = mongoose.model("foundItems", foundSchema);



