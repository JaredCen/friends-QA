var qaSDK = {
	createInit: function (){
		$('.begin-create').on('tap', function (){
			window.location.href = "http://" + window.location.host + "/node-scheme/qa/create/begin";
		});
	},
	createBegin: function (question_hidden, url){
		// 清空数组
		this.storeQuestion = [];
		var _this = this;

		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, false);
		});

		var question_array = question_hidden;
		$('.exchange').on('tap', function (){
			var thisId = parseInt($(this).parent().attr('data-id'));
			var rand = _this.randGenerator(question_array);
			if (rand === false){
				question_array = question_hidden;
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
	answerInit: function (page_id, url){
		$('.begin-answer').on('tap', function(){
			window.location.href = url+"/node-scheme/qa/answer/begin/"+page_id;
		});
	},
	answerBegin: function (url){
		var _this = this;
		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, true);
		});
	},
	visitOther: function (score){
		$('.ball-full').css('height', score + '%');
		this.footerEvent();
		$('.play').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/create";
		});
		$('.check').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/visit/check/"+window.location.href.split("/visit/")[1];
		});
	},
	visitSelf: function (){
		this.footerEvent();
		$('.connect419').on('tap', function (){
			alert("connect to 419!");
		});
		$('.connect520').on('tap', function (){
			alert("connect to 520!");
		});

		$('.remind').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/visit/check/"+window.location.href.split("/visit/")[1];
		});

		$('.user-info').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/visit/check/"+window.location.href.split("/visit/")[1]+"?open_id="+$(this).attr('data-openid');
		});
	},
	check: function (){
		$('.connect').on('tap', function (){
			alert("connect to other place!");
		});
		$('.play').on('tap', function (){
			window.location.href = window.location.href.split("/visit/")[0]+"/create";
		});
	},
	randGenerator: function (array){
		var rand = Math.floor(Math.random()*array.length);
		if (array.length == 0){
			return false;
		} else {
			return rand;
		}
	},
	storeQuestion: [],
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
				url: postUrl+'/node-scheme/qa/create/begin/',
				data: JSON.stringify(dataJson),
				contentType: 'application/json',
				beforeSend: function (xhr, settings){
					$('#loading-toast').css('display', 'block');
				},
				success: function (data){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						window.location.href = postUrl+'/node-scheme/qa/create/finish/'+JSON.parse(data).page_id;
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
						window.location.href = postUrl.split('/answer/')[0]+"/visit/"+JSON.parse(data).page_id;
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
	},
	footerEvent: function (){
		$('#footer button').on('tap', function (){
			alert("more!");
		});
	}
};