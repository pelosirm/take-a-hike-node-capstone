'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const hikeSchema = mongoose.Schema({
    trailName: {
        type: String,
        required: true
    },
    length: {
        type: Number,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    googleMap: {
        type: String,
        required: true
    },
    dateCompleted: {
        type: Date
    },
    notes: {
        type: String
    },
    status: {
        type: Boolean
    }
});


const Hike = mongoose.model('Hike', hikeSchema);

module.exports = Hike
