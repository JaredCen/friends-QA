var connect = require('./connect.js'),
	mongoose = require('mongoose');

var Schema = mongoose.Schema;
var UserQuesSchema = new Schema({
	open_id: String,
	page_id: String,
	q_a: Array,
});

var UserQuesModel = connect.model('UserQues', UserQuesSchema);
var UserQuesDAO = function (){};

UserQuesDAO.prototype.save = function (obj){
	var instance = new UserQuesModel(obj);
	return instance.save();
}

UserQuesDAO.prototype.find = function (obj){
	return UserQuesModel.find(obj).exec();
}

module.exports = new UserQuesDAO();