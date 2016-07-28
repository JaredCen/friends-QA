/*
 *	author: Junrey
 *	desc: 回答者数据表，page_id为userQues数据表的_id
 */
var connect = require('./connect.js'),
	mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserAnsSchema = new Schema({
	page_id: String,
	open_id: String,
	nickname: String,
	headimgurl: String,
	sex: Number,
	q_a: Array,
	score: Number,
	evaluation: String,
    create_at: {type: Date, default: Date.now},
    update_at: {type: Date}
});

var UserAnsModel = connect.model('UserAns', UserAnsSchema);
var UserAnsDAO = function (){};

UserAnsDAO.prototype.save = function (obj){
	var instance = new UserAnsModel(obj);
	return instance.save();
}

UserAnsDAO.prototype.find = function (obj){
	return UserAnsModel.find(obj).exec();
}

UserAnsDAO.prototype.findOne = function (obj){
	return UserAnsModel.findOne(obj).exec();
}

UserAnsDAO.prototype.findAsc = function (obj){
	return UserAnsModel.find(obj).sort({'_id': -1}).exec();
}

module.exports = new UserAnsDAO();