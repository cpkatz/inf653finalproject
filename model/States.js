const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//define schema
const stateSchema = new Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funfacts: [String]
});

module.exports = mongoose.model('State', stateSchema);