const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var GoogleContactSchema = new Schema({}, { strict: false, id: false });
var GoogleContact = mongoose.model('GoogleContact', GoogleContactSchema);

module.exports = GoogleContact;