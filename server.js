const {
    User
} = require('./models/models');
const {
    Hike
} = require('./models/models');
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

// create new user
app.post('/users/create', (req, res) => {
    let username = req.body.username;
    username = username.trim();
    let password = req.body.password;
    password = password.trim();

    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            })
        }

        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    message: 'Internal server error'
                })
            }

            User.create({
                user: username,
                password: hash
            }, (err, item) => {
                if (err) {

                    console.log(err)
                    return res.status(500).json({
                        message: 'Internal server error'
                    });
                }

                if (item) {
                    console.log(`User \`${username}\` created.`);
                    return res.json(username);
                }
            })
        })
    })
})

// sign in user
app.post('/users/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;

    User
        .findOne({
            user: username
        }, function (err, items) {
            if (err) {
                return res.status(500).json({
                    message: "internal server error"
                });
            }
            if (!items) {
                return res.status(401).json({
                    message: "not found"
                })
            } else {
                items.validatePassword(password, function (err, isValid) {
                    if (err) {
                        console.log('Password could not be validated')
                    }
                    if (!isValid) {
                        return res.status(401).json({
                            message: "Not found"
                        })
                    } else {
                        return res.json(items.user);
                    }
                });
            }
        })
})



app.get('/hikes/:location', (req, res) => {
    let location = encodeURI(req.params.location);
    let dataPromise = getCoordinates(location);
    dataPromise.then(function (results) {
        res.json(results.trails)
    })
})

app.get('/trips/:user', (req, res) => {
    let user = req.params.user
    console.log(user)
    Hike
        .find({
            'account': user
        })
        .then(function (results) {
            console.log(results)
            res.json(results)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went horribly awry'
            });
        });
});

// create new hike
app.post('/hikes/create-new', (req, res) => {
    console.log(req.body)
    Hike
        .create({
            trailName: req.body.trailName,
            length: req.body.length,
            img: req.body.img,
            location: req.body.location,
            url: req.body.url,
            googleMap: req.body.googleMap,
            dateCompleted: req.body.dateCompleted,
            notes: req.body.notes,
            status: req.body.status,
            account: req.body.account
        })
        .then(hike => res.status(201).json(req.body.trailName + ' added'))
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'Something went wrong'
            });
        });

});

app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

exports.app = app;
exports.runServer = runServer;
exports.closeServer = closeServer;
