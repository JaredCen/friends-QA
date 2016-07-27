var router = require("koa-router")(),
	UserQues = require('../models/userQues.js'),
	UserAns = require('../models/userAns.js'),
	User = require('../models/user.js'),
	Redis = require('../config/redis.js'),
	parse = require('co-body'),
	oauth = require('wechat-oauth');

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
	this.session.openid = null;
	// 微信授权
	if (!this.session.openid && !this.query.code){
		this.redirect(wechatClient.getAuthorizeURL(encodeURI("http://"+this.request.header.host+"/node-scheme/qa/answer/" + this.params.id), '', 'snsapi_userinfo'));
	} else if (!this.session.openid && this.query.code){
		var code = this.query.code;
		// yield执行Promise回调赋值，得到resolve/reject的表量而非Promise对象;
		this.session.openid = yield new Promise(function(resolve, reject) {
          	wechatClient.getAccessToken(code, function (err, result) {
              	if (err) {
                	console.log("oauth授权失败！");
                	reject(err);
             	} else {
                	resolve(result.data.openid);
              	}
          	});
        });
		var UserMsg = yield User.findOne({open_id: this.session.openid});
		var redisUserMsg = yield Redis.getUserMsg(this.session.openid);
		if (! UserMsg) {
			var userMsg = {};
			wechatClient.getUser(this.session.openid, function(err, result){
				userMsg = {
					open_id: result.openid,
					sex: result.sex,
					nickname: result.nickname,
					headimgurl: result.headimgurl,
			   		city: result.headimgurl,
				    province: result.province,
				    country: result.country,
					union_id: result.unionid
				};
				User.save(userMsg);
			});
			Redis.setUserMsg(this.session.openid, userMsg);
		} else if (UserMsg && !redisUserMsg) {
			Redis.setUserMsg(this.session.openid, UserMsg);
		}
	}

	var userAnsMsg = yield UserAns.findOne({
		page_id: this.params.id,
		open_id: this.session.openid
	});
	var userAnsList = yield UserAns.find({
		page_id: this.params.id
	});
	if(! userAnsMsg){
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
	var userMsg = Redis.getUserMsg(this.session.openid);
	UserAns.save({
		open_id: this.session.openid,
		nickname: userMsg.nickname,
		headimgurl: userMsg.headimgurl,
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