var router = require("koa-router")(),
	UserQues = require('../models/userQues.js'),
	UserAns = require('../models/userAns.js'),
	redis = require('../config/redis.js'),
	parse = require('co-body');

router.get('/:id', function *(next){
	// 微信授权
	if (!this.session.openid && !this.query.code){
		this.redirect(wechatClient.getAuthorizeURL(encodeURI("http://"+this.request.header.host+"/node-scheme/qa/answer/"+this.params.id), '', 'snsapi_userinfo'));
	} else if (!this.session.openid && this.query.code){
		wechatClient.getAccessToken(this.query.code, function(err, result){
			if (err){
				console.warn("oauth授权失败！");
			} else {
				this.session.oauth_access_token = result.data.access_token;
				this.session.openid = result.data.openid;
			}
		});
		var UserMsg = yield User.findOne({open_id: this.session.openid});
		if (UserMsg == ''){
			var userMsg = {};
			wechatClient.getUser(this.session.openid, function(err, result){
				console.log(result);
				userMsg = {
					open_id: result.data.openid,
					sex: result.data.sex,
					nickname: result.data.nickname,
					head_img_url: result.data.headimgurl,
					union_id: result.data.unionid
				};
				User.save(userMsg);
			});
			Redis.setUserMsg(userMsg);
		}
	}

	var userAnsMsg = yield UserAns.findOne({
		page_id: this.params.id,
		open_id: this.session.openid
	});
	var userAnsList = yield UserAns.find({
		page_id: this.params.id
	});
	if(userAnsMsg == ''){
		yield this.render('init', {
			isAnswer: true,
			userList: userAnsList,
			url: "http://"+this.host,
			method: "answerInit("+this.params.id+", url)"
		});
	} else {
		this.redirect("/node-scheme/qa/visit/"+this.params.id);
	}
});

router.get('/begin/:id', function *(next){
	var userQuesMsg = yield UserQues.findOne({page_id: this.params.id});
	yield this.render('begin', {
		isAnswer: true,
		questionMsg: userQuesMsg,
		url: "http://"+this.host+this.url,
		method: "answerBegin(answerCorrect, url)"
	});
});

router.post('/begin/:id', function *(next){
	var userAnsJson = yield parse.json(this);
	// console.log(userAnsJson);
	var q_a_array = [];
	for (var i=0; i<5; i++){
		q_a_array.push({
			sql_id: userAnsJson.data[i].sqlId,
			question: userAnsJson.data[i].question,
			answer_select: userAnsJson.data[i].answer,
			answer_correct: userAnsJson.data[i].answerCorrect,
			correct: userAnsJson.data[i].correct
		});
	}
	var userMsg = redis.getUserMsg(this.session.openid);
	UserAns.save({
		open_id: this.session.openid,
		nickname: userMsg.nickname,
		head_img_url: userMsg.head_img_url,
		sex: userMsg.sex,
		page_id: this.params.id,
		q_a: q_a_array,
		score: userAnsJson.score,
		evaluation: userAnsJson.evaluation		
	});
	this.status = 200;
	this.body = {page_id: this.params.id};
});

module.exports = router;