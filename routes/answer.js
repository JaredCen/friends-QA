var router = require("koa-router")(),
	UserQues = require('../models/userQues.js'),
	UserAns = require('../models/userAns.js'),
	User = require('../models/user.js'),
	Redis = require('../config/redis.js'),
	parse = require('co-body'),
	plugin = require('../config/plugin.js');

var wechatClient =  plugin.wechatOauthInit();

router.get('/:id', function *(next){
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
		}
	}

	// 查询数据库检测是否为出题人
	var userQuesMsg = yield UserQues.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	var userAnsMsg = yield UserAns.findOne({
		page_id: this.params.id,
		open_id: this.session.openid
	});
	var userAnsList = yield UserAns.find({
		page_id: this.params.id
	});
	var sgObj = yield plugin.getSignature(this);
	if(! userAnsMsg && ! userQuesMsg){
		yield this.render('init', {
			isAnswer: true,
			userList: userAnsList,
			url: "http://"+this.host,
			method: "answerInit("+this.params.id+", url)",
			appid: plugin.appid,
			sgObj: sgObj
		});
	} else {
		this.redirect("/node-scheme/qa/visit/"+this.params.id);
	}
});

router.get('/begin/:id', function *(next){
	var sgObj = yield plugin.getSignature(this);
	var userQuesMsg = yield UserQues.findOne({page_id: this.params.id});
	yield this.render('begin', {
		isAnswer: true,
		questionMsg: userQuesMsg,
		url: "http://"+this.host+this.url,
		method: "answerBegin(url)",
		appid: plugin.appid,
		sgObj: sgObj
	});
});

router.post('/begin/:id', function *(next){
	var userAnsJson = yield parse.json(this);
	var userAnsRecord = yield UserAns.findOne({
		open_id: this.session.openid,
		page_id: this.params.id
	});
	if (! userAnsRecord) {
		var userQuesMsg = yield UserQues.findOne({page_id: this.params.id});
		var userMsg = yield Redis.getUserMsg(this.session.openid);
		var q_a_array = [], correct, correctCount = 0, allCount = 0, score, evaluation;
		for (var i=0; i<5; i++) {
			allCount = allCount + parseInt(userQuesMsg.q_a[i].answer.length);
			if (userAnsJson[i].answer == userQuesMsg.q_a[i].answer_correct) {
				correctCount = correctCount + parseInt(userQuesMsg.q_a[i].answer.length);
				correct = true;
			} else {
				correct = false;
			}

			q_a_array.push({
				sql_id: userAnsJson[i].sqlId,
				question: userAnsJson[i].question,
				answer_select: userAnsJson[i].answer,
				answer_correct: userQuesMsg.q_a[i].answer_correct,
				correct: correct
			});
		}
		score = Math.floor(correctCount / allCount * 100);
		if (score >= 0 && score < 20) {
			evaluation = "呵呵，发个红包吧，不然拉黑！";
		} else if (score >= 20 && score <40) {
			evaluation = "为了友谊长存记得查看答案";
		} else if (score >= 40 && score < 60) {
			evaluation = "呵呵哒，还能不能愉快地玩耍";
		} else if (score >= 60 && score < 80) {
			evaluation = "嘿嘿，你挺关心我的嘛";
		} else if (score >= 80 && score < 100) {
			evaluation = "懂我的人不多，你算一个";
		} else if (score == 100) {
			evaluation = "哟，一被子的好朋友";
		}

		// console.log(userMsg.headimgurl);
		UserAns.save({
			open_id: this.session.openid,
			nickname: userMsg.nickname,
			headimgurl: userMsg.headimgurl,
			sex: userMsg.sex,
			page_id: this.params.id,
			q_a: q_a_array,
			score: score,
			evaluation:	evaluation	
		});
	}
	this.status = 200;
	this.body = {page_id: this.params.id};
});

module.exports = router;