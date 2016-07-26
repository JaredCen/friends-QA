var mongoose = require('mongoose'),
	logger = require('../config/log.js');

// mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;

var config = JSON.parse(process.env.mongodb);

var dbUrl = '';

if (config.hostR){
	dbUrl = 'mongodb://' + config.host + ',' + config.hostR + '/' + config.db; 
} else {
	dbUrl = 'mongodb://' + config.host + '/' + config.db; 
}

mongoose.connect(dbUrl, config.opts);

mongoose.connection.once('open', function() {
	console.log('mongodb connect success!');
});

mongoose.connection.on('error', function(err) {
	logger.mongodb(err);
	console.log('mongodb connect error!');
});

module.exports = mongoose;