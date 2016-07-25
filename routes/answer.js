var router = require("koa-router")(),
	UserQues = require('../models/userQues.js'),
	UserAns = require('../models/userAns.js'),
	parse = require('co-body');

router.get('/:id', function *(next){
	var userAnsMsg = yield UserAns.find({
		page_id: this.params.id,
		open_id: 'jai'
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
		this.redirect("/qa/visit/"+this.params.id);
	}
});

router.get('/begin/:id', function *(next){
	var userQuesMsg = yield UserQues.find({page_id: this.params.id});
	yield this.render('begin', {
		isAnswer: true,
		questionMsg: userQuesMsg[0],
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
	UserAns.save({
		open_id: 'iris',
		user_img: '/img/jordon.jpg',
		page_id: this.params.id,
		q_a: q_a_array,
		score: userAnsJson.score,
		evaluation: userAnsJson.evaluation		
	});
	this.status = 200;
	this.body = {page_id: this.params.id};
});

module.exports = router;