const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var MSEmailSchema = new Schema({}, { strict: false, id: false });
var MSEmail = mongoose.model('MSEmail', MSEmailSchema);

module.exports = MSEmail;