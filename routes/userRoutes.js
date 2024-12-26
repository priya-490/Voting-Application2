const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Election = require('../models/election');
const Candidate = require('../models/candidate');

const passport = require('passport');


// check if a user exists or not 
router.post('/check', async(req,res) =>{
    const {email} = req.body;
    try{
        // const user = await user.findOne({username});
        const user = await User.findOne({email});
        if(user){
            return res.json({exists: true});;
        }
        return res.json({exists: false});
    } catch(error){
        console.error(error);
        return res.status(500).json({error: 'internal server error'});
    }
});


// SIGN UP a user
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id,
            username: response.username
        }

        console.log(JSON.stringify(payload));

        const token = generateToken(response.username);

        console.log("token is: ", token);

        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

//login a function
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const payload = {
            id: user.id,
            username: user.username
        }
        const token = generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal server error' });
    }
});

//logout a user
router.post('/logout', jwtAuthMiddleware, (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(400).json({ error: 'token not provided' });
    }
    //add token to the blacklist
    blacklist.add(token);
    res.status(200).json({ message: 'log out successfully, token invalidated' });
});

const checkBlacklistMiddleware = (req,res,next) =>{
    const token = req.headers.authorization.split(' ')[1];
    if(blacklist.has(token)){
        return res.status(401).json({error: 'token is blacklisted , please login again'});
    }
    next();
};

//protected route example
router.get('/protected',jwtAuthMiddleware, checkBlacklistMiddleware,(req,res)=>{
    res.status(200).json({message: 'you accessed a protected route'});
});


// Get method for person
router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const data = await User.find();
        console.log("data is fetched");
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//casting a vote to a candidate in an election
router.post('/castVote/:electionId', async (req, res) => {
    const { electionId } = req.params;
    const { party } = req.body; // Expecting electionId and party from the request body
    // const userId = req.user.id;

    try {
        // Ensure the election exists
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }
        

        // Find and update the candidate's vote count
        const updatedCandidate = await Candidate.findOneAndUpdate(
            { electionId: electionId, party: party }, // Match candidate by election and party
            { $inc: { vote_count: 1 } }, // Increment vote count by 1
            { new: true } // Return the updated candidate document
        );

        if (!updatedCandidate) {
            return res.status(404).json({ message: 'Candidate not found for the specified election and party' });
        }

        res.status(200).json({
            message: 'Vote cast successfully',
            candidate: updatedCandidate
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;