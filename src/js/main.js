var elQuestion = {
	template: '#el-question',
	props: ['question']
};
var elQuestionList = {
	template: '#el-questionlist',
	props: ['classlist'],
	methods: {
		selectQuestion: function(idx) {

			vm.classlist[idx] = true;

			this.$message('选择了第' + idx + '题');

			vm.question = {
				title: '中国共产党是在哪一年成立的？',
				answer: '1921年',
				score: 10,
				curID: 0,
				showAnswer: false,
				time: ''
			};

			vm.on = !vm.on;
		}
	}
};

var arr = [];
for (var i = 0; i < 18; i++) {
	arr.push(false);
}
var timeItvl;

var vm = new Vue({
	el: '#app',
	components: {
		'el-question': elQuestion,
		'el-questionlist': elQuestionList
	},
	data: {
		on: true,
		type: '必答题',
		question: {},
		classlist: arr
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
		goback: function() {
			this.question.showAnswer = false;
			this.on = true;
			if (timeItvl) {
				clearInterval(timeItvl);
			}
		},
		timing: function() {
			this.question.time = 10;
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