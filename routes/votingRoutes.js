const express = require('express');
const router = express.Router();
const UserVote = require('../models/Vote');
const Candidate = require('../models/candidate');
// const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Election = require('../models/election');
// const Candidate = require('../models/candidate');


// note that only a user can cast a vote and not an admin so u have to later on add middleware so that only user and not admin caould cast vote 


//casting a vote
router.post('/', async (req, res) => {
    const { user_id, election_id, candidate_id } = req.body;

    try {
        //check if the user has already voted in this election
        const existingVote = await Vote.findOne({ user_id, election_id });

        if (existingVote) {
            return res.status(400).json({ message: 'you have already voted in this election' });
        }

        // create a new vote
        const newVote = new Vote({ user_id, election_id, candidate_id });
        await newVote.save();
        return res.status(200).json({ message: ' vote casted successfully' });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: ' duplicate vote detected' });
        }
        return res.status(500).json({ message: 'an error occurred', error });
    }
});





module.exports = router; 
