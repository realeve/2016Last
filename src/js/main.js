var arr = [];
var initArr = (function() {
	for (var j = 0; j < 5; j++) {
		arr[j] = [];
		for (var i = 0; i < 18; i++) {
			arr[j].push(false);
		}
	}
})();

var elQuestion = {
	template: '#el-question',
	props: ['question']
};

var getQuestionTitle = function(type, idx) {
	return {
		title: '中国共产党是在哪一年成立的？',
		answer: '1921年'
	};
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
				title: question.title,
				answer: question.answer,
				score: 10,
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
	props: ['type', 'showmask'],
	methods: {
		hideMask: function() {
			vm.showMask = false;
			vm.questionType = qsType.NONE;
		}
	}
};

var qsType = {
	'NONE': -1,
	'IMG': 0,
	'AUDIO': 1,
	'VIDEO': 2
};

var typeList = ['必答题', '抢答题', '风险题(10分)', '风险题(20分)', '风险题(30分)'];

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
		questionType: qsType.AUDIO,
		showMask: false,
		classlist: arr[0],
		classOptions: [{
			label: '题目类型',
			options: [{
				value: 0,
				label: '必答题'
			}, {
				value: 1,
				label: '抢答题'
			}]
		}, {
			label: '风险题',
			options: [{
				value: '2',
				label: '风险题 - 10分'
			}, {
				value: '3',
				label: '风险题 - 20分'
			}, {
				value: '4',
				label: '风险题 - 30分'
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
			this.showMask = true;
			this.questionType = qsType.VIDEO;
		},
		goback: function() {
			this.question.showAnswer = false;
			this.on = true;
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
			this.question.time = this.typeID > 2 ? this.typeID * 10 - 10 : 10;
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