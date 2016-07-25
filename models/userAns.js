var connect = require('./connect.js'),
	mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserAnsSchema = new Schema({
	open_id: String,
	user_img: String,
	page_id: String,
	q_a: Array,
	score: String,
	evaluation: String
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

module.exports = new UserAnsDAO();