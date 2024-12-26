// const express =  require('express');
// const router = express.Router();
const mongoose = require('mongoose');
const Election = require('./election');
const User = require('./user');
const Candidate = require('./candidate');


// voting schema
const VoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    candidate_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
}, {
    timestamps: true,

});

VoteSchema.index({ user_id: 1, election_id: 1 }, { unique: true });

const Vote = mongoose.model('Vote', VoteSchema);
module.exports = Vote;
