var connect = require('./connect.js'),
	mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    open_id: String,
    sex: Number,
    nickname: String,
    headimgurl: String,
    city: String,
    province: String,
    country: String,
    union_id: String,
    create_at: {type: Date, default: Date.now},
    update_at: {type: Date}
});

var UserModel = connect.model('User', UserSchema);
var UserDAO = function (){};

UserDAO.prototype.save = function (obj){
	var instance = new UserModel(obj);
	return instance.save();
}

UserDAO.prototype.find = function (obj){
	return UserModel.find(obj).exec();
}

UserDAO.prototype.findOne = function (obj){
    return UserModel.findOne(obj).exec();
}

module.exports = new UserDAO();