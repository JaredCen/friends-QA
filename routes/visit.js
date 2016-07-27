var router = require("koa-router")(),
	User = require("../models/user.js"),
	UserQues = require("../models/userQues.js"),
	UserAns = require("../models/userAns.js"),
	Redis = require("../config/redis.js"),
	plugin = require('../config/plugin.js');


router.get('/check', function *(next){
	var userQuesMsg = yield UserQues.findOne({
		_id: this.query._id,
		open_id: this.session.openid
	});
	var sgObj = yield plugin.getSignature(this);
	if (! userQuesMsg){
		var userAnsMsg = yield UserAns.findOne({
			page_id: this.query._id,
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
			page_id: this.query._id,
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