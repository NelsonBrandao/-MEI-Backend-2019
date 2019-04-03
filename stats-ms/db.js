const monk = require('monk');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB || 'mei-2019';

module.exports = monk(`${url}/${dbName}`);