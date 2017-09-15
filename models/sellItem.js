var mongoose = require("mongoose");

var sellSchema = new mongoose.Schema({
    author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
    itemName: String,
    DatePosted: String,
    type: String,
    price: String,
    phone: String,
    itemSpecifics: String,
    itemAge: String,
    description: String,
    imageLinks: [String],
    verified: Boolean
});

module.exports = mongoose.model("sellItems", sellSchema);



