var router = require("koa-router")(),
	User = require("../models/user.js"),
	UserQues = require("../models/userQues.js"),
	UserAns = require("../models/userAns.js"),
	Redis = require("../config/redis.js"),
	plugin = require('../config/plugin.js');

router.get('/:id', function *(next){
	var userMsg = yield Redis.getUserMsg(this.session.openid);
 	var sgObj = yield plugin.getSignature(this);
	// 查询数据库检测是否为出题人
	var userQuesMsg = yield UserQues.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	if (! userQuesMsg){
		var userAnsList = yield UserAns.find({page_id: this.params.id});
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.params.id,
			open_id: this.session.openid
		});
		yield this.render('visit', {
			visit_self: false,
			user_ans_msg: userAnsMsg,
			user_ans_list: userAnsList,
			shareUrl: "http://" + this.host + "/node-scheme/qa/visit/qrcode",
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "visitOther(score, footerUrl)",
			url: "http://" + this.host + "/node-scheme/qa/answer/" + this.params.id,
			headimgurl: userMsg.headimgurl,
			appid: plugin.appid,
			sgObj: sgObj
		});
	} else {
		var userAnsList = yield UserAns.find({page_id: this.params.id});
		yield this.render('visit', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			user_ans_list: userAnsList,
			shareUrl: "http://" + this.host + "/node-scheme/qa/visit/qrcode",
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "visitSelf(footerUrl)",
			url: "http://" + this.host + "/node-scheme/qa/answer/" + this.params.id,
			headimgurl: userMsg.headimgurl,
			appid: plugin.appid,
			sgObj: sgObj
		});
	}
});

router.get('/check/:id', function *(next){
	var userQuesMsg = yield UserQues.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	var sgObj = yield plugin.getSignature(this);
	if (! userQuesMsg){
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.params.id,
			open_id: this.session.openid
		});
		yield this.render('check', {
			visit_self: false,
			identity: false,
			user_ans_msg: userAnsMsg,
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "check(footerUrl)",
			appid: plugin.appid,
			sgObj: sgObj
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
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "check(footerUrl)",
			appid: plugin.appid,
			sgObj: sgObj
		});		
	} else {
		yield this.render('check', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "check(footerUrl)",
			appid: plugin.appid,
			sgObj: sgObj
		});	
	}
});

router.get('/more', function *(next){
	var word = [
		{"main": "撩", "color": "pink", "title": "hey，知道怎么撩我吗", "count": "500"}, 
		{"main": "睡", "color": "red", "title": "睡一觉多少钱", "count": "300"}, 
		{"main": "忆", "color": "green", "title": "回忆贩卖机", "count": "100"}, 
		{"main": "访", "color": "blue", "title": "朋友圈访客", "count": "100"}
	];
	yield this.render('more', {
		word: word,
		method: "more()"
	});
});

router.get('/qrcode', function *(next){
	yield this.render('qrcode', {});
});

module.exports = router;