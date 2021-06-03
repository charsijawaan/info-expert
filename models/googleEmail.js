const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var GoogleEmailSchema = new Schema({}, { strict: false, id: false });
var GoogleEmail = mongoose.model('GoogleEmail', GoogleEmailSchema);

module.exports = GoogleEmail;