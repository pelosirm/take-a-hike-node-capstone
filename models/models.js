'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const tripSchema = mongoose.Schema({
    tripName: {
        type: String,
        required: true
    }
});

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
    dateCompleted: {
        type: Date
    },
    notes: {
        type: String
    }
});



//hikeSchema.virtual('hikeInfo').get(function() {
//    return `${this.author.firstName} ${this.author.lastName}`.trim();
//});

hikeSchema.methods.serialize = function () {
    return {
        id: this._id,
        hikeName: this.hikeName,
        length: this.length,
        img: this.imge,
        difficulty: this.difficulty,
        stars: this.stars,
        url: this.url
    };
};

const Hike = mongoose.model('Hike', hikeSchema);
const Trip = mongoose.model('Trip', tripSchema);

module.exports = {
    Hike
};
module.exports = {
    Trip
}
