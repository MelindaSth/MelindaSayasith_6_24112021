// IMPORTATION PACKAGE

const mongoose = require('mongoose');
const  uniqueValidator  =  require ('mongoose-unique-validator') ;

// DEFINITION DU SCHEMA

const schemaUser = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, required: true},
})

// EXPORTATION DU MODULE

schemaUser.plugin(uniqueValidator);

module.exports = mongoose.model('User', schemaUser)