// candidate data->
// name 
// party
//electionId
// votecount

const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
const Election = require("./election");


const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    party: {
        type: String,
        required: true
    },

    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election',
        required: true,
        index: true, // index for frequent filtering by election
    },

    vote_count: {
        type: Number,
        default: 0 ,
        required: true,
    }
}, {timestamps : true});


//create candidate model
const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;