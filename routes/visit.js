var router = require("koa-router")(),
	oauth =require("wechat-oauth"),
	User = require("../models/user.js"),
	UserQues = require("../models/userQues.js"),
	UserAns = require("../models/userAns.js"),
	Redis = require("../config/redis.js");

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

	// 微信授权
	// if (!this.session.openid && !this.query.code){
	// 	this.redirect(wechatClient.getAuthorizeURL(encodeURI("https://"+this.request.header.host+"/qa/visit"), this.params.id, 'snsapi_userinfo'));
	// 	console.log(encodeURI("https://"+this.request.header.host+"/qa/visit"));
	// } else if (!this.session.openid && this.query.code){
	// 	wechatClient.getAccessToken(this.query.code, function(err, result){
	// 		if (err){
	// 			console.warn("oauth授权失败！");
	// 		} else {
	// 			this.session.oauth_access_token = result.data.access_token;
	// 			this.session.openid = result.data.openid;
	// 		}
	// 	});
	// 	var UserMsg = yield User.findOne({open_id: this.session.openid});
	// 	if (UserMsg == ''){
	// 		var userMsg = {};
	// 		wechatClient.getUser(this.session.openid, function(err, result){
	// 			console.log(result);
	// 			userMsg = {
	// 				open_id: result.data.openid,
	// 				sex: result.data.sex,
	// 				nickname: result.data.nickname,
	// 				head_img_url: result.data.headimgurl,
	// 				union_id: result.data.unionid
	// 			};
	// 			User.save(userMsg);
	// 		});
	// 		Redis.setUserMsg(userMsg);
	// 	}
	// }

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
			method: "visitOther()"
		});
	} else {
		var userAnsList = yield UserAns.find({page_id: this.params.id});
		yield this.render('visit', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			user_ans_list: userAnsList,
			method: "visitSelf()"
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