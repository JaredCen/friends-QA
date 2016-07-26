var router = require("koa-router")(),
	oauth =require("wechat-oauth"),
	User = require("../models/user.js"),
	UserQues = require("../models/userQues.js"),
	UserAns = require("../models/userAns.js"),
	Redis = require("../config/redis.js"),
	plugin = require('../config/plugin.js');

var	appid = process.env.appid,
	appsecret = process.env.appsecret;

var wechatClient = new oauth(appid, appsecret, function (openid, callback){
		Redis.getToken(openid).then((token) => {
			callback(null, token);
		});
	}, function (openid, token, callback){
		Redis.setToken(openid, token).then(callback());
	});

wechatClient.setOpts({"timeout": 2000});


router.get('/:id', function *(next){
	var userMsg = yield Redis.getUserMsg(this.session.openid);
 	var sgObj = yield plugin.getSignature("http://" + this.host + this.url);

	// 查询数据库检测是否为出题人
	var userQuesMsg = yield UserQues.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	if (userQuesMsg == ''){
		var userAnsList = yield UserAns.find({page_id: this.params.id});
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.params.id,
			open_id: this.session.openid
		});
		yield this.render('visit', {
			visit_self: false,
			user_ans_msg: userAnsMsg,
			user_ans_list: userAnsList,
			method: "visitOther()",
			url: "http://" + this.host + "/node-scheme/qa/answer/" + this.params.id,
			headimgurl: userMsg.headimgurl,
			appid: appid,
			timestamp: sgObj.timestamp,
			nonceStr: sgObj.noncestr,
			signature: sgObj.signature
		});
	} else {
		var userAnsList = yield UserAns.find({page_id: this.params.id});
		yield this.render('visit', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			user_ans_list: userAnsList,
			method: "visitSelf()",
			url: "http://" + this.host + "/node-scheme/qa/answer/" + this.params.id,
			headimgurl: userMsg.headimgurl,
			appid: appid,
			timestamp: sgObj.timestamp,
			nonceStr: sgObj.noncestr,
			signature: sgObj.signature
		});
	}
});

router.get('/check/:id', function *(next){
	var userQuesMsg = yield UserQues.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	if (userQuesMsg == ''){
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.params.id,
			open_id: this.session.openid
		});
		yield this.render('check', {
			visit_self: false,
			identity: false,
			user_ans_msg: userAnsMsg,
			method: "check()"
		});
	} else if (this.query.open_id) {	
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.params.id,
			open_id: this.query.open_id
		});		
		yield this.render('check', {
			visit_self: false,
			identity: true,
			user_ans_msg: userAnsMsg,
			method: "check()"
		});		
	} else {
		yield this.render('check', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			method: "check()"
		});	
	}
});

module.exports = router;