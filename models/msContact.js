const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var MSContactSchema = new Schema({}, { strict: false, id: false });
var MSContact = mongoose.model('MSContact', MSContactSchema);

module.exports = MSContact;