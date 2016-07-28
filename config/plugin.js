/*
 *	author: Junrey
 *	desc: 其实更应该叫config.js
 */

var crypto = require('crypto'),
	oauth = require('wechat-oauth'),
	Redis = require('./redis.js');

var plugin = {
	// 微信JS-SDK的签名生成算法，jsticket由API提供
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
	// wechat-oauth模块初始化且存取token方法（此token非access_token）
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
	// 中转域名随机渲染
	domainManage: function (){
		if (! process.env.stHost) {
			return "m.yeyeapp.in";
		} else {
			var domain = [
				"728.yeyejump.com",
				"728.yeyelink.com"
			];
			var rand = Math.floor(Math.random() * domain.length);
			return domain[rand];
		}
	},
	appid: process.env.appid,
	appsecret: process.env.appsecret,
	// 静态文件目录，线上环境||本地代理环境
	staticHost: process.env.stHost || "//m.yeyeapp.in:3000"
}

module.exports = plugin;