'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout

const expect = chai.expect;

const {
    User
} = require('../models/models');
const {
    Hike
} = require('../models/models');
const {
    app,
    runServer,
    closeServer
} = require('../server');
const {
    TEST_DATABASE_URL
} = require('../config');

chai.use(chaiHttp);

function createTrip() {
    return {
        trailName: faker.lorem.words(),
        length: faker.random.number(),
        img: faker.image.imageUrl(),
        location: faker.lorem.words(),
        url: faker.internet.url(),
        googleMap: faker.internet.url(),
        dateCompleted: faker.date.future(),
        notes: faker.lorem.words(),
        status: true,
        account: 'demo'
    }
}


describe('Hike API resource', function () {

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });


    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {

        it('should return hike information for legitimate location', function () {
            let res;
            return chai.request(app)
                .get('/hikes/atlanta')
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.trails).to.have.length.of.at.least(1);
                })
        });

        it('should return error for not a place', function () {
            let res;
            return chai.request(app)
                .get('/hikes/asdlkajsd;la')
                .then(function (_res) {
                    res = _res;
                    expect(res).to.be.json;
                })
        });

        it('should return all trips by user', function () {
            let res;
            return chai.request(app)
                .get('/trips/demo')
                .then(function (_res) {
                    res = _res;
                    expect(res).to.be.json;
                    res.body.forEach(function (trip) {
                        expect(trip).to.be.a('object');
                        expect(trip).to.include.keys(
                            'trailName', 'length', 'location', 'status', 'notes', 'dateCompleted');
                    })
                })
        })
    })

    describe('POST endpoint', function () {

        it('should add hikes to user account', function () {

            const newTrip = createTrip();
            let mostRecentGrade;

            return chai.request(app)
                .post('/hikes/create-new')
                .send(newTrip)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                })

        });

        it('should add new user', function () {

            const newUser = {
                username: 'Cindy',
                password: '123'
            }

            return chai.request(app)
                .post('/users/create')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                })

        })
    });

    describe('DELETE endpoint', function () {

        it('delete a hike by id', function () {

            let hike;

            return Hike
                .findOne()
                .then(function (_hike) {
                    hike = _hike;
                    return chai.request(app).delete(`/trips/delete/${hike.id}`);
                })
                .then(function (res) {
                    expect(res).to.have.status(204);
                    return Hike.findById(hike.id);
                })
                .then(function (_hike) {
                    expect(_hike).to.be.null;
                });
        });
    });
})
