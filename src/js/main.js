var arr = [];

//问题最大长度
var ANSWERLENGTH = 23;

var initArr = (function() {
	for (var j = 0; j < 10; j++) {
		arr[j] = [];
		for (var i = 0; i < (j < 8 ? 17 : 6); i++) {
			arr[j].push(false);
		}
	}
})();

var elQuestion = {
	template: '#el-question',
	props: ['question', 'type', 'src']
};

//当前问题属性记录
var curQuestion;

var getQuestionTitle = function(type, idx) {
	var question = questionList[type][idx];
	var obj = {
		question: question.question,
		answer: question.answer
	};

	curQuestion = {
		type: qsType.NONE
	};
	if (typeof question.type != 'undefined') {
		curQuestion.type = question.type;
		curQuestion.src = question.src;
		vm.questionType = question.type;
		vm.src = question.src;
	}

	return obj;
};

var elQuestionList = {
	template: '#el-questionlist',
	props: ['classlist'],
	methods: {
		selectQuestion: function(idx) {
			vm.classlist[idx] = true;
			this.$message('选择了第' + idx + '题');
			var question = getQuestionTitle(vm.typeID, idx);
			vm.question = {
				title: question.question,
				answer: question.answer,
				shorter: question.question.length > ANSWERLENGTH,
				shorterAnswer: question.answer.length > ANSWERLENGTH - 4,
				curID: 0,
				showAnswer: false,
				time: ''
			};
			vm.on = !vm.on;
		}
	}
};

var elMask = {
	template: '#el-mask',
	props: ['type', 'showmask', 'src'],
	methods: {
		hideMask: function() {
			vm.showMask = false;
		}
	}
};

var qsType = {
	'NONE': -1,
	'IMG': 0,
	'AUDIO': 1,
	'VIDEO': 2
};

var typeList = ['必答题 第一轮', '必答题 第二轮', '抢答题 第一轮', '抢答题  第二轮', '风险题(10分)', '风险题(20分)', '风险题(30分)', '支部书记答题', '观众答题', '附加题'];

var timeItvl;

var vm = new Vue({
	el: '#app',
	components: {
		'el-question': elQuestion,
		'el-questionlist': elQuestionList,
		'el-mask': elMask
	},
	data: {
		on: true,
		typeID: 0,
		type: '必答题',
		question: {},
		questionType: qsType.NONE,
		src: '',
		showMask: false,
		classlist: arr[0],
		classOptions: [{
			label: '必答题',
			options: [{
				value: 0,
				label: '第一轮'
			}, {
				value: 1,
				label: '第二轮'
			}]
		}, {
			label: '抢答题',
			options: [{
				value: 2,
				label: '第一轮'
			}, {
				value: 3,
				label: '第二轮'
			}]
		}, {
			label: '风险题',
			options: [{
				value: 4,
				label: '风险题 - 10分'
			}, {
				value: 5,
				label: '风险题 - 20分'
			}, {
				value: 6,
				label: '风险题 - 30分'
			}]
		}, {
			label: '其它',
			options: [{
				value: 7,
				label: '支部书记答题'
			}, {
				value: 8,
				label: '观众答题'
			}, {
				value: 9,
				label: '附加题'
			}]
		}]
	},
	watch: {
		typeID: function() {
			this.type = typeList[this.typeID];
			this.classlist = arr[this.typeID];
			if (!this.on) {
				this.goback();
			}
		}
	},
	methods: {
		showAnswer: function() {
			if (!this.on) {
				this.question.showAnswer = true;
			}
			if (timeItvl) {
				clearInterval(timeItvl);
			}
		},
		lightoff: function() {

			if (curQuestion.type == qsType.NONE) {
				return;
			}

			this.showMask = true;
			this.questionType = curQuestion.type;
			switch (curQuestion.type) {
				case qsType.AUDIO:
					break;
				case qsType.IMG:
					break;
				case qsType.VIDEO:
					//还未响应，需在下一时钟周期触发
					vm.$nextTick(function() {
						if (flvjs.isSupported()) {
							var videoElement = document.getElementById('videoElement');
							var flvPlayer = flvjs.createPlayer({
								type: 'flv',
								cors: true,
								url: curQuestion.src
							});
							flvPlayer.attachMediaElement(videoElement);
							flvPlayer.load();
							flvPlayer.play();
						}

					});
					break;
			}
		},
		goback: function() {
			this.question.showAnswer = false;
			this.on = true;
			this.questionType = qsType.NONE;
			if (timeItvl) {
				clearInterval(timeItvl);
			}
		},
		timing: function() {
			if (this.on) {
				return;
			}
			if (timeItvl) {
				clearInterval(timeItvl);
			}
			this.question.time = (this.typeID == 5 || this.typeID == 6) ? this.typeID * 10 - 30 : 10;
			this.question.showAnswer = false;
			var _self = this;
			timeItvl = setInterval(function() {
				_self.question.time--;
				if (_self.question.time === 0) {
					_self.question.time = '时间到';
					clearInterval(timeItvl);
				}
			}, 1000);

		}
	}
});

$(function() {
	$('.content').height($(document).height());
});