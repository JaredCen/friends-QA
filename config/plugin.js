var crypto = require('crypto'),
	Redis = require('./redis.js');

var appid = process.env.appid;

var plugin = {
	getSignature: function *(url){
		var stringSign = {
			jsapi_ticket: yield Redis.getTicket(appid),
			noncestr: Math.random().toString(36).substr(2),
			timestamp: Math.floor(+new Date() / 1000),
			url: url
		};
		var string1 = '';
		for (i in stringSign) {
			string1 += i + "=" + stringSign[i] + "&";
		}
	    var sha1 = crypto.createHash('sha1');
	    sha1.update(string1.substr(0, string1.length - 1));
	    var sgObj = {
	    	noncestr: stringSign.noncestr,
	    	timestamp: stringSign.timestamp,
	    	signature: sha1.digest('hex')
	    }
	    return sgObj;
	}
}

module.exports = plugin;