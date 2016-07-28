
/*
 *	author: Junrey
 *	desc: 所有页面的前端js代码都在这里，用对象字面量封装，每个页面调用哪些函数通过路由渲染到前端页面
 * 	
 */

var qaSDK = {
	// 出题初始化页面
	createInit: function (){
		$('.begin-create').on('tap', function (){
			window.location.href = "http://" + window.location.host + "/node-scheme/qa/create/begin";
		});
	},
	// 开始出题
	createBegin: function (question_hidden, url){
		// 清空数组
		this.storeQuestion = [];
		var _this = this;

		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, false);
		});

		var question_array = new Array();
		question_array = question_hidden.slice(0);
		$('.exchange').on('tap', function (){
			var thisId = parseInt($(this).parent().attr('data-id'));
			var rand = _this.randGenerator(question_array);
			if (rand === false){
				question_array = new Array();
				question_array = question_hidden.slice(0);
			} else {
				// 从数组中取出一组数据并替换到当前题目中
				$('.ques-pic[data-id="'+thisId+'"]').addClass('showin');
				$('.ans-group[data-id="'+thisId+'"]').addClass('showin');
				setTimeout(function (){
					$('.ques-pic[data-id="'+thisId+'"]').removeClass('fadein showin');
					$('.ans-group[data-id="'+thisId+'"]').removeClass('fadein showin');					
				}, 700);

				$('.ques-pic[data-id="'+thisId+'"]').attr('data-sql-id', question_array[rand].sqlId);
				$('.ans-group[data-id="'+thisId+'"]').attr('data-sql-id', question_array[rand].sqlId);
				$('.ques-pic[data-id="'+thisId+'"] img').attr('src', question_array[rand].imgSrc);
				$('.ques-pic[data-id="'+thisId+'"] .ques').html(question_array[rand].question);
				$('.ans-group[data-id="'+thisId+'"] .answer').remove();
				for (i in question_array[rand].answer){
					$('.ans-group[data-id="'+thisId+'"]').append('<div class="answer"><span>'+question_array[rand].answer[i]+'</span></div>');
				}
				$(".ans-group > div").off();
				$(".ans-group > div").on('click', function (){
					_this.beginAnswerSelect($(this), url, _this, false);
				});
				question_array.splice(rand, 1);
			}
		});
	},
	// 回答初始化页面
	answerInit: function (page_id, url){
		$('.begin-answer').on('tap', function(){
			window.location.href = url+"/node-scheme/qa/answer/begin?_id=" + page_id;
		});
	},
	// 开始回答
	answerBegin: function (url){
		var _this = this;
		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, true);
		});
	},
	// 回答者访问已回答的页面
	visitOther: function (score, url){
		$('#footer button').on('tap', function (){
			window.location.href = url;
		});
		$('.ball-full').css('height', score + '%');
		$('.play').on('tap', function (){
			window.location.href = window.location.href.split("/answer")[0]+"/create";
		});
		$('.check').on('tap', function (){
			window.location.href = window.location.href.split("/answer")[0]+"/visit/check"+window.location.href.split("/answer")[1];
		});
	},
	// 创建者访问自己创建的页面
	visitSelf: function (url){
		$('#footer button').on('tap', function (){
			window.location.href = url;
		});
		$('.connect419').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/scheme/moments/redpack/create-timeline/3";
		});
		$('.connect520').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/scheme/friends-exposes/visit/1152998";
		});

		$('.remind').on('tap', function (){
			window.location.href = window.location.href.split("/answer")[0]+"/visit/check"+window.location.href.split("/answer")[1];
		});

		$('.user-info').on('click', function (){
			window.location.href = window.location.href.split("/answer")[0]+"/visit/check"+window.location.href.split("/answer")[1]+"&open_id="+$(this).attr('data-openid');
		});
	},
	// 查看答案
	check: function (url){
		$('.connect').on('tap', function (){
			window.location.href = url;
		});
		$('.play').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/create";
		});
	},
	// 与其他活动页的链接
	more: function (){
		$('.proj-0').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/scheme/friends-exposes/visit/1152998";
		});
		$('.proj-1').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/scheme/moments/redpack/create-timeline/3";
		});
		$('.proj-2').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/scheme/friends-memory/visit/7442";
		});
		$('.proj-3').on('tap', function (){
			window.location.href = "http://m.yeyeapp.in/node/care/care-index?upid=5798929f70cc9bda5ebd751a";
		});
	},
	// 随机数生成，用于出题时的换题操作
	randGenerator: function (array){
		var rand = Math.floor(Math.random()*array.length);
		if (array.length == 0){
			return false;
		} else {
			return rand;
		}
	},
	// 该数组用来存已选答案
	storeQuestion: [],
	// 控制选择答案的操作
	beginAnswerSelect: function (objSelector, postUrl, obj, isAnswer){
		$('.ans-group .selected').removeClass('selected');
		objSelector.addClass('selected');

		var thisId = parseInt(objSelector.parent().attr('data-id'));

		obj.storeQuestion.push({
			sqlId: parseInt(objSelector.parent().attr('data-sql-id')),
			question: $('.ques-pic[data-id="'+thisId+'"] .ques').html(),
			answer: objSelector.find('span').html()
		});

		if(thisId < 5){
			setTimeout(function (){
				$('.ques-pic[data-id="'+thisId+'"]').removeClass('active');
				$('.ans-group[data-id="'+thisId+'"]').removeClass('active');
				$('.ques-pic[data-id="'+(thisId+1)+'"]').addClass('active');
				$('.ans-group[data-id="'+(thisId+1)+'"]').addClass('active');

				$('.order-'+thisId+'').removeClass('selected');
				$('.order-'+(thisId+1)+'').addClass('selected');
			}, 100);
		}

		if(thisId == 5 && !isAnswer){
			var dataJson = {};
			for(var i=0; i<5; i++){
				dataJson[i] = obj.storeQuestion[i];
			}
			obj.storeQuestion = [];
			$.ajax({
				type: 'post',
				url: postUrl+'/node-scheme/qa/create/begin',
				data: JSON.stringify(dataJson),
				contentType: 'application/json',
				beforeSend: function (xhr, settings){
					$('#loading-toast').css('display', 'block');
				},
				success: function (data){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						window.location.href = postUrl+'/node-scheme/qa/create/finish?_id='+JSON.parse(data)._id;
					}, 500);
				},
				error: function (xhr, type){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						alert('数据上传失败');
					}, 500);
				}
			});
		}

		if(thisId == 5 && isAnswer){
			var dataJson = {};
			for(var i=0; i<5; i++){
				dataJson[i] = obj.storeQuestion[i];
			}
			obj.storeQuestion = [];
			$.ajax({
				type: 'post',
				url: postUrl,
				data: JSON.stringify(dataJson),
				contentType: 'application/json',
				beforeSend: function (xhr, settings){
					$('#loading-toast').css('display', 'block');
				},
				success: function (data){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						window.location.href = postUrl.split('/answer/')[0]+"/answer?_id="+JSON.parse(data)._id;
					}, 500);
				},
				error: function (xhr, type){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						alert('数据上传失败');
					}, 500);
				}
			});	
		}
	}
};