const mongoose = require('mongoose');
const  uniqueValidator  =  require ('mongoose-unique-validator') ;

// "unique" afin que les utilisateurs n'ait pas les mêmes informations

const schemaUser = mongoose.Schema({
    email: {type: String, require: true, unique: true},
    password: {type: String, required: true},
})

schemaUser.plugin(uniqueValidator);

module.exports = mongoose.model('User', schemaUser)