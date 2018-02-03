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


// ---------------- EXTERNAL API CALL FUNCTIONS -----------------------------------------------------
// exteral API call functions

//get coordinates

let getCoordinates = function (location) {

    let emitter = new events.EventEmitter();

    let options = {
        host: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?address=' + location + '&key=AIzaSyCVzoNkzkIo8VFN-_0dI0sIs5JuED8EPpE',
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };

    https.get(options, function (res) {
        let body = '';
        res.on('data', function (chunk) {

            body += chunk;

        })
        res.on('end', function () {
                let results;
                body = JSON.parse(body);
                if (body.status == 'ZERO_RESULTS') {
                    let message = {
                        message: 'Not found'
                    }
                    results = message;
                } else {
                    results = body.results[0].geometry.location;
                }
                emitter.emit('end', results);
            })
            .on('error', function (e) {
                emitter.emit('error', e)
            });
    });

    return emitter;

};


let getHikes = function (coordinates) {
    let emitter = new events.EventEmitter();


    let options = {
        host: 'www.hikingproject.com',
        path: '/data/get-trails?lat=' + coordinates.lat + '&lon=' + coordinates.lng + '&maxDistance=10&key=200208774-24dfee334bb22d6484c0a63d8884816d',
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };

    https.get(options, function (res) {
        let body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var jsonFormattedResults = JSON.parse(body);
            emitter.emit('end', jsonFormattedResults);
        })

    }).on('error', function (e) {

        emitter.emit('error', e);
    });

    return emitter;
};


// ---------------- SIGN IN / CREATE USER -----------------------------------------------------
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
                    //                    console.log(`User \`${username}\` created.`);
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

// ---------------- HIKE DATA ENDPOINTS -----------------------------------------------------


//get hikes given user input
app.get('/hikes/:location', (req, res) => {
    const retrieveCoordinates = getCoordinates(encodeURI(req.params.location));

    retrieveCoordinates.on('end', function (item) {

        let coordinates = item
        let retrieveHikes = getHikes(coordinates)

        retrieveHikes.on('end', function (hikes) {
            res.json(hikes);
        })

        retrieveHikes.on('error', function (code) {
            res.sendStatus(code);
        })
    })

    retrieveCoordinates.on('error', function (code) {
        res.sendStatus(code);
    })

})

// get trips by user
app.get('/trips/:user', (req, res) => {
    let user = req.params.user
    Hike
        .find({
            'account': user
        })
        .then(function (results) {
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

//update information for hikes
app.put('/trips/update/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        res.status(400).json({
            error: 'Request path id and request body id values must match'
        });
    }

    const updated = {};
    const updateableFields = ['status', 'dateCompleted', 'notes'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            updated[field] = req.body[field];
        }
    });

    Hike
        .findByIdAndUpdate(req.params.id, {
            $set: updated
        }, {
            new: true
        }, function (err, results) {
            if (err) {
                res.status(500).json({
                    message: 'Something went wrong'
                })
            }
            res.json(results.serialize())
        });

});

//delete trip
app.delete('/trips/delete/:id', (req, res) => {
    let item = req.params.id
    Hike
        .remove({
            _id: item
        }, function (err) {
            if (err) {
                console.log(err)
            } else {
                res.status(204).end();
            }
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
