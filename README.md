# 基于koa，mongodb，redis，微信JS-SDK的好友问答游戏

>鉴于公众号相关信息的保密工作，相关信息已删除或替换。

### 环境配置

#### 环境依赖
- nodejs v4.4.7

- mongodb

- redis

- nginx,squid代理配置linux微信开发环境

#### 依赖安装

>npm install (--production)

### 启动方式

>pm2 start start.json

>pm2 start ./bin/start

>node-dev ./bin/start

### 文件目录

```
activ-QA                            
    ├── bin/                            // 启动文件目录
    │   ├── start                       // 不带环境变量启动配置
    │   └── process_controller.js       // 多进程启动配置
    │
    ├── config/
    │    ├── log.js                     // log输出配置文件
    │    ├── plugin.js                  // 一些服务端复用度高的代码封装在这里
    │    └── redis.js                   // redis配置及存取方法
    │
    ├── logs/                           // log文件目录
    │
    ├── public/                         // 生产环境静态文件目录
    │    └── img/, lib/, scripts/, styles/ 
    │
    ├── routes/                         // koa路由文件
    │
    ├── src/                            // html,less开发文件目录
    │    ├── html/, less/, rev/（版本号）
    │    └── scripts/
    │        ├── jweixin.js             // 微信js-sdk
    │        └── main.js                // 所有页面的前端js逻辑
    │
    ├── views/                          // xtpl模板文件，其余模板全部继承index.xtpl
    │
    ├── README.md
    ├── app.js
    ├── gulpfile.js
    ├── package.json
    ├── question.json                   // 所有备选问题的录入文件（只保留了一小部分问题库）
    ├── start.example.json              // 线上pm2启动配置文件
    └── start.json                      // 本地pm2启动配置文件
```

### 路由管理

>未设值代理： host = localhost:3000

>设置代理： host = 代理地址

PS： 因为微信没有基于linux系统的开发工具，因此只能在手机上调试微信授权且需要劫持域名设置代理！

```
/node-scheme/qa/create/update       // 访问该路由录入question.json问题库

/node-scheme/qa/create              // 用户出题初始页面

/node-scheme/qa/create/begin        // 用户出题ing

/node-scheme/qa/create/finish       // 出题完成

/node-scheme/qa/answer              // 对用户情况判断（渲染至答题初始化页面/答题完的查看页面）

/node-scheme/qa/answer/begin        // 答题ing

/node-scheme/qa/visit/check         // 查看答案

```
