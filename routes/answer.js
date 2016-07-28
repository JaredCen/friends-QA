var router = require("koa-router")(),
	UserQues = require('../models/userQues.js'),
	UserAns = require('../models/userAns.js'),
	User = require('../models/user.js'),
	Redis = require('../config/redis.js'),
	parse = require('co-body'),
	plugin = require('../config/plugin.js');

var wechatClient =  plugin.wechatOauthInit();

router.get('/', function *(next){
	// this.session.openid = null;
	// 微信授权
	if (!this.session.openid && !this.query.code){
		this.redirect(wechatClient.getAuthorizeURL(encodeURI("http://"+this.host+"/node-scheme/qa/answer?_id=" + this.query._id), '', 'snsapi_userinfo'));
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
	// 查询数据库检测是否为出题人
	var userQuesMsg = yield UserQues.findOne({
		_id: this.query._id,
		open_id: this.session.openid
	});
	// 判断是否已经回答过问题
	var userAnsMsg = yield UserAns.findOne({
		page_id: this.query._id,
		open_id: this.session.openid
	});
	// 获取所有回答者数据
	var userAnsList = yield UserAns.findAsc({
		page_id: this.query._id
	});
	var userMsg = yield Redis.getUserMsg(this.session.openid);
	var sgObj = yield plugin.getSignature(this);
	if(! userAnsMsg && ! userQuesMsg){
		// 非创建者且未回答
		yield this.render('init', {
			isAnswer: true,
			userList: userAnsList,
			_id: this.query._id,
			url: "http://"+this.host,
			method: "answerInit(page_id, url)",
			appid: plugin.appid,
			sgObj: sgObj,
			staticHost: plugin.staticHost
		});
	} else if (! userAnsMsg && userQuesMsg._id) {
		// 创建者
		var domain = plugin.domainManage();
		yield this.render('visit', {
			visit_self: true,
			user_ques_msg: userQuesMsg,
			user_ans_list: userAnsList,
			shareUrl: "http://" + this.host + "/node-scheme/qa/visit/qrcode",
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "visitSelf(footerUrl)",
			url: "http://" + domain + "/node-scheme/qa/answer?_id=" + this.query._id,
			headimgurl: userMsg.headimgurl,
			appid: plugin.appid,
			sgObj: sgObj,
			staticHost: plugin.staticHost
		});
	} else if (userAnsMsg._id && ! userQuesMsg) {
		// 未回答者
		var domain = plugin.domainManage();
		yield this.render('visit', {
			visit_self: false,
			user_ans_msg: userAnsMsg,
			user_ans_list: userAnsList,
			shareUrl: "http://" + this.host + "/node-scheme/qa/visit/qrcode",
			footerUrl: "http://" + this.host + "/node-scheme/qa/visit/more",
			method: "visitOther(score, footerUrl)",
			url: "http://" + domain + "/node-scheme/qa/answer?_id=" + this.query._id,
			headimgurl: userMsg.headimgurl,
			appid: plugin.appid,
			sgObj: sgObj,
			staticHost: plugin.staticHost
		});		
	}
});

router.get('/begin', function *(next){
	var sgObj = yield plugin.getSignature(this);
	var userQuesMsg = yield UserQues.findOne({_id: this.query._id});
	yield this.render('begin', {
		isAnswer: true,
		questionMsg: userQuesMsg,
		url: "http://"+this.host+this.url,
		method: "answerBegin(url)",
		appid: plugin.appid,
		sgObj: sgObj,
		staticHost: plugin.staticHost
	});
});

router.post('/begin', function *(next){
	var userAnsJson = yield parse.json(this);
	// can be ignored...
	var userAnsRecord = yield UserAns.findOne({
		page_id: this.query._id,
		open_id: this.session.openid
	});
	if (! userAnsRecord) {
		var userQuesMsg = yield UserQues.findOne({_id: this.query._id});
		var userMsg = yield Redis.getUserMsg(this.session.openid);
		// 回答得分计算
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

		UserAns.save({
			page_id: this.query._id,
			open_id: this.session.openid,
			nickname: userMsg.nickname,
			headimgurl: userMsg.headimgurl,
			sex: userMsg.sex,
			q_a: q_a_array,
			score: score,
			evaluation:	evaluation	
		});
	}
	this.status = 200;
	this.body = {_id: this.query._id};
});

module.exports = router;