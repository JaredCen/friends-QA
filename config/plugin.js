var crypto = require('crypto'),
	oauth = require('wechat-oauth'),
	Redis = require('./redis.js');

var plugin = {
	getSignature: function *(that){
		var url = "http://" + that.host + that.url;
		var _this = this;
		var stringSign = {
			jsapi_ticket: yield Redis.getTicket(_this.appid),
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
	},
	wechatOauthInit: function (){
		var _this = this;
		var wechatClient = new oauth(_this.appid, _this.appsecret, function (openid, callback){
				Redis.getToken(openid).then((token) => {
					callback(null, token);
				});
			}, function (openid, token, callback){
				Redis.setToken(openid, token).then(callback());
			});
		wechatClient.setOpts({"timeout": 2000});
		return wechatClient;
	},
	appid: process.env.appid,
	appsecret: process.env.appsecret
}

module.exports = plugin;