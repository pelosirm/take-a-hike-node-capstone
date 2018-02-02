'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    },
    account: {
        type: String,
        required: true
    }
});

const userSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, isValid) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, isValid);
    });
};

hikeSchema.methods.serialize = function() {
    return {
        trailName : this.trailName,
        length : this.length,
        location : this.location,
        status: this.status,
        notes: this.notes,
        dateCompleted: this.dateCompleted,
    };
};

const Hike = mongoose.model('Hike', hikeSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
    Hike: Hike,
    User: User,
}
