var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var FacSchema={
    Fname       :       String,
    Age         :       String,
    sex         :       String,
    Subjects    :       [Subjects], //the different subjects taken by the faculty.
    author      :       [user]
};

var Subjects = {
    Sname       :       String,
    Scode       :       String,
    IA          :       [IA],
    External    :       [External]
};
var IA  =   {
        usn     :   String,
        marks   :   String,
        internal:   String // 1,2,3.... project reviews
};
var External = {
    usn      :   String,
    Imarks   :   String,
    Emarks   :   String
}
module.exports = mongoose.model("Fac", FacSchema);