const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');
const Election = require('../models/election');
const Candidate = require('../models/candidate');
const passport = require('passport');



// Apply jwtAuthMiddleware to all routes except the login route
// router.use((req, res, next) => {
//     if (req.path === '/login') return next(); // Skip middleware for login route
//     jwtAuthMiddleware(req, res, next); // Apply middleware to other routes
// });



//login route for admin
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username: username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const payload = {
            id: admin.id,
            username: admin.username
        }
        const token = generateToken(payload);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal server error' });
    }
});


//create a new election
router.post('/elections', /*jwtAuthMiddleware,*/ async (req, res) => {
    const { name, startDate, endDate } = req.body;
    try {
        const election = new Election({
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            candidates: []
        });
        await election.save();
        res.status(201).json(election);
    } catch (error) {
        res.status(500).json({ error: "failed to create election" });
    }
});


// add candidate to an election
router.post("/elections/:electionId/candidates", async (req, res) => {
    // console.log(req.body);
    // console.log("Request received for adding candidate:", req.params.electionId);

    const { electionId } = req.params;
    const { name, party } = req.body;
    const vote_count = 0;

    if (!name || !party) {
        return res.status(400).json({ error: "Name and party are required" });
    }

    try {
        const candidate = new Candidate({ name, party, vote_count, electionId });
        await candidate.save();

        const updatedElection = await Election.findByIdAndUpdate(
            electionId,
            { $push: { candidates: candidate._id } },
            { new: true }
        );
        if (!updatedElection) {
            return res.status(404).json({ error: "Election not found" });
        }
        res.status(200).json({ message: "Candidate added", updatedElection });
    } catch (err) {
        console.error("error handling candidate: ", err);
        res.status(500).json({ error: "internal server error" });

    }
});

// demo api
// add candidate to an election
router.post("/elections/candidates", async (req, res) => {
    // console.log(req.body);
    // console.log("Request received for adding candidate:", req.params.electionId);

    // const { electionId } = req.params;
    const { name, party, electionId } = req.body;
    const vote_count = 0;
    if (!name || !party) {
        return res.status(400).json({ error: "Name and party are required" });
    }

    try {
        const candidate = new Candidate({ name, party, vote_count, electionId });
        await candidate.save();

        const updatedElection = await Election.findByIdAndUpdate(
            electionId,
            { $push: { candidates: candidate._id } },
            { new: true }
        );
        if (!updatedElection) {
            return res.status(404).json({ error: "Election not found" });
        }
        res.status(200).json({ message: "Candidate added", updatedElection });
    } catch (err) {
        console.error("error handling candidate: ", err);
        res.status(500).json({ error: "internal server error" });

    }
});

// view candidate for an election
router.get('/elections/:electionId/candidates', (req, res) => {
    const { electionId } = req.params;

    Election.findById(electionId)
        .populate('candidates')
        .then(election => res.status(200).json(election.candidates))
        .catch(err => res.status(500).json({ error: err.message }));
});

// deleting a candidate form an election
router.delete('/delete/:candidateId', async (req, res) => {
    try {
        const { candidateId } = req.params;

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'candidate not found' });
        }
        console.log('data deleted');
        res.status(200).json({ message: 'candidate data deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
});


//update candidate information
router.put('/elections/:electionId/candidates/:candidateId', (req, res) => {
    const { candidateId } = req.params;
    const { name, party } = req.body;

    Candidate.findByIdAndUpdate(candidateId, { name, party }, { new: true })
        .then(updatedCandidate => res.status(200).json({ message: 'candidate updated', updatedCandidate }))
        .catch(err => res.status(500).json({ error: err.message }));
});



// //casting a vote to a candidate in an election
// router.post('/castVote/:electionId', async (req, res) => {
//     const { electionId } = req.params;
//     const { party } = req.body; // Expecting electionId and party from the request body
//     try {
//         // Ensure the election exists
//         const election = await Election.findById(electionId);
//         if (!election) {
//             return res.status(404).json({ message: 'Election not found' });
//         }

//         // Find and update the candidate's vote count
//         const updatedCandidate = await Candidate.findOneAndUpdate(
//             { electionId: electionId, party: party }, // Match candidate by election and party
//             { $inc: { vote_count: 1 } }, // Increment vote count by 1
//             { new: true } // Return the updated candidate document
//         );

//         if (!updatedCandidate) {
//             return res.status(404).json({ message: 'Candidate not found for the specified election and party' });
//         }

//         res.status(200).json({
//             message: 'Vote cast successfully',
//             candidate: updatedCandidate
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// router.post('/demo', (req, res) => {
//     console.log("API has been fetched");

//     // Optionally process the incoming data
//     const data = req.body; // Ensure `body-parser` middleware is used if needed
//     console.log("Received data:", data);

//     // Send a response
//     res.json({ message: "API has been successfully fetched", data: data });
// });

module.exports = router;