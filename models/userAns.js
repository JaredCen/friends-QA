var connect = require('./connect.js'),
	mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserAnsSchema = new Schema({
	open_id: String,
	nickname: String,
	headimgurl: String,
	sex: Number,
	page_id: String,
	q_a: Array,
	score: String,
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

module.exports = new UserAnsDAO();