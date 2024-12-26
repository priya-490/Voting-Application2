const mongoose = require('mongoose');
const Candidate = require('./candidate');

const electionSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    startDate: {
        type: Date,
        required: true,
    },

    endDate: {
        type: Date,
        required: true,
        index: true, // index for better querying
    },
    
    candidates: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Candidate',
        },
    ],
}, {toJSON: {virtuals : true}, toObject: {virtuals: true} });

// Define the virtual field `isActive`
electionSchema.virtual('isActive').get(function() {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
});

// Ensure the `isActive` virtual field is included in output
electionSchema.set('toObject', { virtuals: true });
electionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Election', electionSchema);
