const {
    Hike
} = require('./models/models.js');
const {
    Trip
} = require('./models/models.js');
const mongoose = require('mongoose');
const events = require('events');
const https = require('https');
const unirest = require('unirest');
const bodyParser = require('body-parser');
const config = require('./config');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const express = require('express');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.Promise = global.Promise;

// ---------------- RUN/CLOSE SERVER -----------------------------------------------------
let server = undefined;

function runServer(urlToUse) {
    return new Promise((resolve, reject) => {
        mongoose.connect(urlToUse, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(config.PORT, () => {
                console.log(`Listening on localhost:${config.PORT}`);
                resolve();
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

if (require.main === module) {
    runServer(config.DATABASE_URL).catch(err => console.error(err));
}

function closeServer() {
    return mongoose.disconnect().then(() => new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }));
}

// exteral API call functions

//get coordinates

let getCoordinates = function (location) {

    let options = {
        host: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?address=' + location + '&key=AIzaSyCVzoNkzkIo8VFN-_0dI0sIs5JuED8EPpE',
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };

    return new Promise(function (resolve, reject) {
        https.get(options, function (res) {
            let body = '';
            let location = {}
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                body = JSON.parse(body);
                location = body.results[0].geometry.location;
                resolve(getHikes(location));
            })

        })
    })

};

let getHikes = function (coordinates) {

    let options = {
        host: 'www.hikingproject.com',
        path: '/data/get-trails?lat=' + coordinates.lat + '&lon=' + coordinates.lng + '&maxDistance=10&key=200208774-24dfee334bb22d6484c0a63d8884816d',
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };
    return new Promise(function (resolve, reject) {
        https.get(options, function (res) {
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                body = JSON.parse(body);
                resolve(body)
            })
        })
    })
}



app.get('/hikes/:location', (req, res) => {
    console.log(req.params.location);
    let location = req.params.location;
    let dataPromise = getCoordinates(location);
    dataPromise.then(function (results) {
        res.json(results.trails)
    })
})

app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

exports.app = app;
exports.runServer = runServer;
exports.closeServer = closeServer;
