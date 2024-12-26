const express = require('express')
const router = express.Router();
const app = express();
const cors = require('cors');

const db = require('./db');
require('dotenv').config();
const path = require('path');
// const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors()); // Enable CORS

app.use(bodyParser.json()); // will store in req.body
app.use(express.json()); // Add this to parse JSON request bodies

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.send('Hey how can i help you');
});

const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);
const user = require('./models/user'); 

// const candidateRoutes = require('./routes/candidateRoutes');
// app.use('/candidate',candidateRoutes);
// const candidate = require('./models/candidate');

const route = router.post('/demo', (req, res) => {
    console.log("API has been fetched");
    
    // Optionally process the incoming data
    const data = req.body; // Ensure `body-parser` middleware is used if needed
    console.log("Received data:", data);
    
    // Send a response
    res.json({ message: "API has been successfully fetched", data: data });
});
// app.use('/demo', route);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin',adminRoutes);
const admin = require('./models/admin'); 

const electionRoutes = require('./routes/electionRoutes');
app.use('/',electionRoutes);
const election = require('./models/election'); 

const votingRoutes = require('./routes/votingRoutes');
app.use('/',votingRoutes);
const voting = require('./models/Vote'); 

const PORT = process.env.PORT || 5000;

app.listen(PORT);