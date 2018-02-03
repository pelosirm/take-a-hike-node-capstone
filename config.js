exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:admin@ds111598.mlab.com:11598/take-a-hike';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:admin@ds123698.mlab.com:23698/take-a-hike-test';
exports.PORT = process.env.PORT || 8080;
