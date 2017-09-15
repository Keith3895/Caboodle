var mongoose = require("mongoose");

var lostSchema = new mongoose.Schema({
    author: {
	     type: mongoose.Schema.Types.ObjectId,
	     ref: "User"
	},
    itemName: String,
    lostDate: String,
    lostPlace: String,
    itemSpecifics: String,
    phone: Number,
    description: String,
    imageLinks: [String],
    verified: Boolean
});

module.exports = mongoose.model("lostItems", lostSchema);



