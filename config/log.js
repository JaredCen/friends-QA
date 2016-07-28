/*
 *	author: Junrey
 *	desc: log配置，添加类别时修改categories属性
 */
var path = require('path'),
	Logger = require('mini-logger');

// 日志记录配置
var logger = Logger({
	dir: path.resolve(__dirname, '../logs'),
	categories: ['http', 'mongodb', 'redis'],
	format: '[{category}.]YYYY-MM-DD[.log]',
	timestamp: true
});

module.exports = logger;