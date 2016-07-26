var router = require("koa-router")(),
	oauth =require("wechat-oauth"),
	Question = require('../models/questions.js'),
	UserQues = require('../models/userQues.js'),
	redis = require('../config/redis.js'),
	path = require('path'),
	fs = require('fs'),
	parse = require('co-body');

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

// 录入问题库脚本
router.get('/update', function *(next){
	yield Question.delete();
	new Promise(function (resolve, reject){
		fs.readFile(path.join(__dirname, '../question.json'), 'utf-8', function (err, file){
			if (err){
				reject(err);
			} else {
				resolve(file);
			}
		});
	}).then(function (file){
		var data = eval('('+file+')');
		for (i in data) {
			Question.save(data[i]);
		}
		this.body = "问题录入成功！";
	}).catch(function (err){
		console.log(err);
	});
});

router.get('/', function *(next){

	// 微信授权
	if (!this.session.openid && !this.query.code){
		this.redirect(wechatClient.getAuthorizeURL(encodeURI("http://"+this.request.header.host+"/node-scheme/qa/create"), '', 'snsapi_userinfo'));
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
	
	yield this.render('init', {
		isAnswer: false,
		method: "createInit()"
	});
});

router.get('/begin', function *(next){
	var query = yield Question.find();
	var questionVisible = [], questionHidden = [];
	for (var i=0; i<5; i++) {
		var rand = Math.floor(Math.random()*(query.length-i));
		questionVisible.push(query[rand]);
		query.splice(rand, 1);
	}
	for (j in query) {
		questionHidden.push(query[j]);
	}	
	yield this.render('begin', {
		isAnswer: false,
		question_visible: questionVisible,
		question_hidden: questionHidden,
		url: "http://"+this.host,
		method: "createBegin(questionHidden, url)"
	});
});

router.post('/begin', function *(next){
	var userQuesJson = yield parse.json(this);
	var userQuesMsg = yield UserQues.find();
	var q_a_array = [];
	var pageId = userQuesMsg.length+1;
	for (var i=0; i<5; i++){
		var questionArray = yield Question.find({id: userQuesJson[i].sqlId});
		// console.log(userQuesJson);
		q_a_array.push({
			sql_id: userQuesJson[i].sqlId,
			question: userQuesJson[i].question,
			answer_correct: userQuesJson[i].answer,
			img_src: questionArray[0].img_src,
			answer: questionArray[0].answer
		});
	}
	var userMsg = redis.getUserMsg(this.session.openid);
	var userQuesObj = {
		open_id: this.session.openid,
		nickname: userMsg.nickname,
		head_img_url: userMsg.head_img_url,
		sex: userMsg.sex,
		page_id: pageId,
		q_a: q_a_array
	};
	UserQues.save(userQuesObj);
	this.status = 200;
	this.body = {page_id: pageId};
});

router.get('/finish/:id', function *(next){
	// 调用微信js-sdk
	var jsticket = redis.getTicket(appid);
	var noncestr = Math.random().toString(36).substr(2);

	yield this.render('finish', {
		appid: appid,
		timestamp: Math.floor( +new Date() / 1000),
		nonceStr: noncestr,
		signature: jsticket
	});
});

module.exports = router;