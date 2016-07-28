/*
 *	author: Junrey
 *	desc: 当用此方法启动多进程时，需要修改pm2配置文件start.json
 *	PS: pm2有cluster模式启动、管理多进程（ pm2 start start.json -i max/进程数 ）
 * 	
 */

var cluster = require('cluster'),
	os = require('os');

var app = require('../app.js'),
	debug = require('debug')('http'),
	http = require('http'),
	logger = require('../config/log.js');

var CPUs = os.cpus();
var pidArray = [];

// 开发文档demo
// cluster('app')
//   .use(cluster.logger('logs'))
//   .use(cluster.stats())
//   .use(cluster.pidfiles('pids'))
//   .use(cluster.cli())
//   .use(cluster.repl(8888))
//   .listen(3000);

if (cluster.isMaster) {
	// 判断是否为主进程
	CPUs.forEach(function (){
		pidArray.push(cluster.fork().process.pid);
	});
	cluster.on("listening", function (worker, address){
		console.log("A worker with #" + worker.id + ", pid:" + worker.process.pid + "is now connect to" + address.address + ":" + address.port);
	});
	cluster.on("exit", function (worker, code, signal){
		console.log("Worker with pid:" + worker.process.pid + "is dead, now start another");
		for (var i in pidArray) {
			if (pidArray[i] == worker.process.pid) {
				pidArray.splice(i, 1);
			}
		}
		setTimeout(function (){
			pidArray.push(cluster.fork().process.pid);
		}, 2000);
	});

} else {
	http.createServer(app.callback())
		.listen(process.env.PORT || '3000')
		.on('listening', function() {
			  var bind = typeof this.address() === 'string'
			    ? 'pipe ' + this.address()
			    : 'port ' + this.address().port;
			  debug('Listening on ' + bind);
		})
		.on('error', function(err) {
			if (process.env.NODE_ENV != 'test') {
				logger.http(err);
				console.log(err);
			}
		});	
}

// SIGTERM is a killSignal（当时间或者缓冲区超限时终止进程的信号）
// 关闭所有进程
process.on('SIGTERM', function () {
    for (var i in pidArray) {
    	process.kill(pidArray[i]);
    }
    process.exit(0);
});