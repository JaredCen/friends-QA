var qaSDK = {
	createInit: function (){
		$('.begin-create').on('tap', function (){
			window.location.href = "http://" + window.location.host + "/qa/create/begin";
		});
	},
	createBegin: function (question_hidden, url){
		// 清空数组
		this.storeQuestion = [];
		var _this = this;

		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, false, null);
		});

		$('.exchange').on('tap', function (){
			var thisId = parseInt($(this).parent().attr('data-id'));
			var rand = _this.randGenerator(question_hidden);
			if (rand){
				// 从数组中取出一组数据并替换到当前题目中
				$('.ques-pic[data-id="'+thisId+'"]').attr('data-sql-id', question_hidden[rand].sqlId);
				$('.ans-group[data-id="'+thisId+'"]').attr('data-sql-id', question_hidden[rand].sqlId);
				$('.ques-pic[data-id="'+thisId+'"] img').attr('src', question_hidden[rand].imgSrc);
				$('.ques-pic[data-id="'+thisId+'"] .ques').html(question_hidden[rand].question);
				$('.ans-group[data-id="'+thisId+'"] .answer').remove();
				for (i in question_hidden[rand].answer){
					$('.ans-group[data-id="'+thisId+'"]').append('<div class="answer"><span>'+question_hidden[rand].answer[i]+'</span></div>');
				}
				$(".ans-group > div").off();
				$(".ans-group > div").on('click', function (){
					_this.beginAnswerSelect($(this), url, _this, false, null);
				});
			} else {
				console.log('question.length=0');
			}
		});
	},
	answerInit: function (page_id, url){
		$('.begin-answer').on('tap', function(){
			window.location.href = url+"/qa/answer/begin/"+page_id;
		});
	},
	answerBegin: function (answer_correct, url){
		var _this = this;
		$(".ans-group > div").on('tap', function (){
			_this.beginAnswerSelect($(this), url, _this, true, answer_correct);
		});
	},
	visitOther: function (){
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
		array.splice(rand, 1);
		if (array.length == 0){
			return false;
		} else {
			return rand;
		}
	},
	storeQuestion: [],
	beginAnswerSelect: function (objSelector, postUrl, obj, isAnswer, correctAnswer){
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
			// 题目设置完毕
			var dataJson = {};
			for (var i=0; i<5; i++){
				dataJson[i] = obj.storeQuestion[i];
			}
			obj.storeQuestion = [];

			$.ajax({
				type: 'post',
				url: postUrl+'/qa/create/begin/',
				data: JSON.stringify(dataJson),
				contentType: 'application/json',
				beforeSend: function (xhr, settings){
					$('#loading-toast').css('display', 'block');
				},
				success: function (data){
					setTimeout(function (){
						$('#loading-toast').css('display', 'none');
						window.location.href = postUrl+'/qa/create/finish/'+JSON.parse(data).page_id;
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
			for (var i=0; i<5; i++){
				obj.storeQuestion[i].answerCorrect = correctAnswer[i].answerCorrect;
				obj.storeQuestion[i].score = "50%";
				if (obj.storeQuestion[i].answer == correctAnswer[i].answerCorrect){
					obj.storeQuestion[i].correct = true;
				} else {
					obj.storeQuestion[i].correct = false;
				}
				dataJson[i] = obj.storeQuestion[i];
			}
			obj.storeQuestion = [];

			$.ajax({
				type: 'post',
				url: postUrl,
				data: JSON.stringify({
					score: "59%",
					evaluation: "dddd",
					data: dataJson
				}),
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