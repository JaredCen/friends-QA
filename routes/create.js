var router = require("koa-router")(),
	Question = require('../models/questions.js'),
	UserQues = require('../models/userQues.js'),
	path = require('path'),
	fs = require('fs'),
	parse = require('co-body');

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
	var userQuesObj = {
		open_id: "junrey",
		page_id: pageId,
		q_a: q_a_array
	};
	UserQues.save(userQuesObj);
	this.status = 200;
	this.body = {page_id: pageId};
});

router.get('/finish/:id', function *(next){
	yield this.render('finish', {
		// null
	});
});

module.exports = router;