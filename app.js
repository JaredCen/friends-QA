var app = require('koa')(),
	xtpl = require('xtpl/lib/koa'),
	serve = require('koa-static'),
	router = require('koa-router')(),
	session = require('koa-session-redis');

var create = require('./routes/create.js'),
	answer = require('./routes/answer.js'),
	visit = require('./routes/visit.js');

// xtemplate模板配置
xtpl(app, {
	views: './views'
});

// redis configs
var redisConfig = JSON.parse(process.env.redis);
console.log(redisConfig);
app.keys = ['yeyejohnshwang'];
app.use(session({
    store: {
	    host: redisConfig.host,
	    port: redisConfig.port,
	    ttl: 60*60*24
    }
  }
));

// 挂载静态文件
app.use(serve(__dirname + '/public'));

// 注入路由中间件
app.use(router.routes())
	.use(router.allowedMethods());


router.get('/qa', function *(next){
	this.redirect('/qa/create');
});

router.use('/qa/create', create.routes(), create.allowedMethods());
router.use('/qa/answer', answer.routes(), answer.allowedMethods());
router.use('/qa/visit', visit.routes(), visit.allowedMethods());

module.exports = app;