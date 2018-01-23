exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:admin@ds111598.mlab.com:11598/take-a-hike';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:admin@ds111598.mlab.com:11598/take-a-hike';
exports.PORT = process.env.PORT || 8080;
