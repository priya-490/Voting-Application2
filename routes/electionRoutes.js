const express = require('express');
const Election = require('../models/election');
const router = express.Router();
const Candidate = require('../models/candidate');
const Vote = require('../models/Vote');

// Get all elections
router.get('/api/elections', async (req, res) => {
    try {
        const elections = await Election.find()
            .populate('candidates', 'name party vote_count');
        res.status(200).json(elections);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch elections" });
    }
});

//fetches details of a specific election and its candidates
router.get('/api/elections/:id', async(req,res) =>{
    const electionId = req.params.id;
       try{
           const election = await Election.findById(electionId).populate('candidates');
           if(!election){
               return res.status(404).json({error: "Election not found"});
           }
           res.status(200).json({
               id: election._id,
               name: election.name,
               startDate: election.startDate,
               endDate: election.endDate,
               isActive: election.isActive,
               candidates: election.candidates.map(candidate => ({
                   id: candidate._id,
                   name: candidate.name,
                   party: candidate.party
               }))
           });
       }catch(error){
           console.error("error fetching details: ", error);
           res.status(500).json({error: "failed to fetch election details"});
       }
})

// fetchs the elections user has voted in
router.get('/api/user/votes', async (req, res) => {
    try {

        const userId = req.user._id; // get user id from query parameters

        if (!userId) {
            return res.status(400).json({ message: " user Id is required" });
        }

        // find votes for the user
        const userVotes = await UserVote.find({ userId }).populate('electionId', 'name date');

        if (!userVotes.length) {
            return res.status(404).json({ message: "no votes found for this user" });
        }

        res.status(200).json({ votes: userVotes });

    } catch (error) {
        console.error("error fetching user votes: ", error);
        res.status(500).json({ message: "internal server error" });
    }
});

// casting vote for an election
router.post('api/vote/:id', async(req,res) =>{
    const electionId = req.params.id;
    const userId = req.user.id; //assume user id is obtained from middleware after authentication

    try{
        //find the lection and check if it is active
        const election = await Election.findById(electionId);
        if(!election || !election.isActive){
            return res.status(400).json({error: "election is not active or does not exist"});
        }
        // check if the user has already voted in this election
        const existingVote = await Vote.findOne({userId, electionId});
        if(existingVote){
            return res.status(400).json({error: "you have already voted in this election"});
        }

        // find the candidate the user voted for 
        const {candidateId} = req.body;
        const candidate = await Candidate.findById(candidateId);
        if(!candidate || candidate.electionId.toString() !== electionId){
            return res.status(400).json({error : "invalid candidate"});
        }
        //record the vote
        const vote = new Vote({userId, electionId, candidateId});
        await vote.save();

        //increment the candidate's vote count
        await Candidate.findByIdAndUpdate(candidateId, {$inc: {vote_count: 1}});
        res.status(201).json({message: "vote cast successfully"});
    }catch(error){
        console.error("error submitting vote: ", error);
        re.status(500).json({error: "failed to cast vote"});
    }
});


module.exports = router;
