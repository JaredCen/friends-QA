var router = require("koa-router")(),
	UserQues = require("../models/userQues.js"),
	UserAns = require("../models/userAns.js");

router.get('/:id', function *(next){
	// 查询数据库检测是否为出题人
	var userQuesMsg = yield UserQues.find({
		open_id: "junrey",
		page_id: this.params.id
	});
	if (userQuesMsg == ''){
		this.redirect('/qa/visit/other/'+this.params.id);
	} else {
		this.redirect('/qa/visit/self/'+this.params.id);
	}
});

router.get('/other/:id', function *(next){
	var userAnsList = yield UserAns.find({page_id: this.params.id});
	var userAnsMsg = yield UserAns.find({
		page_id: this.params.id,
		open_id: "iris"
	});
	yield this.render('visit', {
		visit_self: false,
		user_ans_msg: userAnsMsg[0],
		user_ans_list: userAnsList,
		method: "visitOther()"
	});
});

router.get('/self/:id', function *(next){
	var userQuesMsg = yield UserQues.find({
		open_id: "junrey",
		page_id: this.params.id
	});	
	var userAnsList = yield UserAns.find({page_id: this.params.id});
	yield this.render('visit', {
		visit_self: true,
		user_ques_msg: userQuesMsg[0],
		user_ans_list: userAnsList,
		method: "visitSelf()"
	});
});

router.get('/other/check/:id', function *(next){
	var userAnsMsg = yield UserAns.find({
		page_id: this.params.id,
		open_id: "iris"
	});
	yield this.render('check', {
		visit_self: false,
		identity: false,
		user_ans_msg: userAnsMsg[0],
		method: "check()"
	});
});

router.get('/self/check/:id', function *(next){
	var userQuesMsg = yield UserQues.find({
		open_id: "junrey",
		page_id: this.params.id
	});		
	if (this.querystring){
		var userAnsMsg = yield UserAns.find({
			page_id: this.params.id,
			open_id: this.querystring.split("open_id=")[1]
		});		
		yield this.render('check', {
			visit_self: false,
			identity: true,
			user_ans_msg: userAnsMsg[0],
			method: "check()"
		});		
	} else {
		yield this.render('check', {
			visit_self: true,
			user_ques_msg: userQuesMsg[0],
			method: "check()"
		});	
	}
});

module.exports = router;