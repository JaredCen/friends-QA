var router = require("koa-router")(),
	Question = require('../models/questions.js'),
	UserQues = require('../models/userQues.js'),
	User = require('../models/user.js'),
	Redis = require('../config/redis.js'),
	path = require('path'),
	fs = require('fs'),
	parse = require('co-body'),
	plugin = require('../config/plugin.js');

var wechatClient =  plugin.wechatOauthInit();

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
		console.log("问题录入成功！");
	}).catch(function (err){
		console.log(err);
	});
});

router.get('/', function *(next){
	// this.session.openid = null;
	// 微信授权
	if (!this.session.openid && !this.query.code){
		this.redirect(wechatClient.getAuthorizeURL(encodeURI("http://"+this.host+"/node-scheme/qa/create"), '', 'snsapi_userinfo'));
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
		if (! UserMsg) {
			var userMsg = {};
			var _this = this;
			// this is a async function !
			yield new Promise((resolve, reject) => {
				wechatClient.getUser(this.session.openid, function(err, result){
					if (err) {
						reject(err);
					} else {
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
						Redis.setUserMsg(_this.session.openid, userMsg);
						resolve(true);
					}
				});				
			});
		} 
	}

	var sgObj = yield plugin.getSignature(this);
	yield this.render('init', {
		isAnswer: false,
		method: "createInit()",
		appid: plugin.appid,
		sgObj: sgObj,
		staticHost: plugin.staticHost
	});
});

router.get('/begin', function *(next){
	var userMsg = yield Redis.getUserMsg(this.session.openid);
	var query = yield Question.find({sex: userMsg.sex});
	var questionVisible = [], questionHidden = [];
	for (var i=0; i<5; i++) {
		var rand = Math.floor(Math.random()*query.length);
		questionVisible.push(query[rand]);
		query.splice(rand, 1);
	}
	for (j in query) {
		questionHidden.push(query[j]);
	}	

	var sgObj = yield plugin.getSignature(this);
	yield this.render('begin', {
		isAnswer: false,
		question_visible: questionVisible,
		question_hidden: questionHidden,
		url: "http://"+this.host,
		method: "createBegin(questionHidden, url)",
		appid: plugin.appid,
		sgObj: sgObj,
		staticHost: plugin.staticHost
	});
});

router.post('/begin', function *(next){
	var userQuesJson = yield parse.json(this);
	var q_a_array = [];
	for (var i=0; i<5; i++){
		var questionArray = yield Question.findOne({id: userQuesJson[i].sqlId});
		q_a_array.push({
			sql_id: userQuesJson[i].sqlId,
			question: userQuesJson[i].question,
			answer_correct: userQuesJson[i].answer,
			img_src: questionArray.img_src,
			answer: questionArray.answer
		});
	}
	var userMsg = yield Redis.getUserMsg(this.session.openid);
	var userQuesObj = {
		open_id: this.session.openid,
		nickname: userMsg.nickname,
		headimgurl: userMsg.headimgurl,
		sex: userMsg.sex,
		q_a: q_a_array
	};
	var userQuesMsg = yield UserQues.save(userQuesObj);
	var _id = userQuesMsg._id;
	this.status = 200;
	this.body = {_id: _id};
});

router.get('/finish', function *(next){
	var userMsg = yield Redis.getUserMsg(this.session.openid);
	// 调用微信js-sdk
 	var sgObj = yield plugin.getSignature(this);
	var domain = plugin.domainManage();
	yield this.render('finish', {
		url: "http://" + domain + "/node-scheme/qa/answer?_id=" + this.query._id,
		shareUrl: "http://" + this.host + "/node-scheme/qa/visit/qrcode",
		headimgurl: userMsg.headimgurl,
		appid: plugin.appid,
		sgObj: sgObj,
		staticHost: plugin.staticHost
	});
});

module.exports = router;