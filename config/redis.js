/*
 *  author: Junrey
 *  desc: redis 建立链接、存取操作
 *  PS: I/O读取操作皆为异步，用promise封装异步调用
 */
var redis = require('redis'),
	User = require('../models/user.js'),
	logger = require('./log.js'),
	request = require('request');

var appid = process.env.appid,
	redisConfig = JSON.parse(process.env.redis);

var redisClient = redis.createClient(redisConfig.port, redisConfig.host);

redisClient.on('connect', function (err){
	console.log("redis connect successful!");
});

redisClient.on('error', function (err){
	logger.redis(err);
	console.log("redis connect error");
});

var RedisOP = function (){};
// 从API拿JS-SDK的jsticket
RedisOP.prototype.getTicket = function (appid){
    return new Promise((resolve, reject) => {
        redisClient.get(appid + 'jsticket', function (err, data) {
            data = JSON.parse(data);
            if (data && (Number(data.jsapi_ticket_deadline) - 500) > (Date.parse(new Date()) / 1000)) {
                resolve(data.jsapi_ticket);
            } else {
                request('http://zeus.shendun.info/server/api/fwh-jsapi-ticket?app_id=' + appid, function (error, response, body) {
                    if (!error && response.statusCode == 200){
                        data = JSON.parse(body).data;
                        redisClient.set(appid + '_jsticket', JSON.stringify(data), function (){
                            // 设置键超时
                            redisClient.expire(appid + '_jsticket', 2 * 24 * 60 * 60);
                        });
                        resolve(data.jsapi_ticket);
                    } else {
                        console.warn(err);
                        reject(err);  
                    }               
                });
            }
        });
    });
}

// wechat-oauth授权模块初始化存token
RedisOP.prototype.setToken = function (openid, token){
    return new Promise((resolve, reject) => {
        redisClient.set(appid + openid + "_access_token", JSON.stringify(token), function (err){
            if (err){
                console.warn(err);
                reject(err);
            } else {
                redisClient.expire(appid + openid + "_access_token", 24 * 60 * 60);
                resolve(true);
            }  
        });
    });
}
// wechat-oauth授权模块初始化取token
RedisOP.prototype.getToken = function (openid){
    return new Promise((resolve, reject) => {
        redisClient.get(appid + openid + "_access_token", function (err, token){
            if (err){
                console.warn(err);
                reject(err);
            } else {
                resolve(JSON.parse(token));              
            }  
        });
    });
}
// 存微信用户信息缓存，缓存信息有改动时，务必修改key值后缀
RedisOP.prototype.setUserMsg = function (openid, obj){
    redisClient.set(appid + openid + "_qa_user_msg", JSON.stringify(obj), function (err){
        if (err){
            console.warn(err);          
        } else {
            redisClient.expire(appid + openid + "_qa_user_msg", 24 * 60 * 60);
        }
    });
}
// 取微信用户信息缓存，缓存过期时从服务器中取
RedisOP.prototype.getUserMsg = function (openid){
    return new Promise((resolve, reject) => {
        redisClient.get(appid + openid + "_qa_user_msg", function (err, data){
            var userData = JSON.parse(data);
            if (! userData) {
                User.findOne({open_id: openid}).then((userMsg) => {
                    redisClient.set(appid + openid + "_qa_user_msg", JSON.stringify(userMsg), function (err){
                        redisClient.expire(appid + openid + "_qa_user_msg", 24 * 60 * 60);
                    });
                    resolve(userMsg);
                });
            } else {
                resolve(userData);             
            }
        });
    });
}

module.exports = new RedisOP();