var draw = (function() {
	var users = {
		online: {
			data: [],
			random: [],
			pCount: 0
		},
		offline: {
			data: [],
			random: [],
			pCount: 0
		}
	};

	function initList(start, end) {
		function randomsort(a, b) {
			return Math.random() > 0.5 ? -1 : 1;
		}

		function getRandomArr() {
			var arr = [];
			if (typeof end == 'undefined') {
				end = start;
				start = 0;
			}
			for (var i = start; i <= end; i++) {
				arr.push(i);
			}
			return arr.sort(randomsort);
		}
		return getRandomArr();
	}

	var getUserList = function() {
		var sportid = 4; //人大选举
		//sportid = 5;//两学一做
		$.ajax({
			url: 'http://cbpc540.applinzi.com/index.php?s=/addon/GoodVoice/GoodVoice/getCheckinListIn2016&sportid=' + sportid,
			dataType: "jsonp",
			callback: "JsonCallback"
		}).done(function(data) {
			data.forEach(function(item, i) {
				if (item.realtime == "0") {
					users.offline.data.push(item.user);
				} else {
					users.online.data.push(item.user);
				}
			});
			randomUserList();
		});
	};

	var randomUserList = function() {
		console.log('用户列表数据初始化完毕');
		if (users.online.data.length == 0) {
			return;
		}
		users.online.random = initList(users.online.data.length - 1);
		users.offline.random = initList(users.offline.data.length - 1);
		users.online.pCount = 0;
		users.offline.pCount = 0;
	};

	var doDraw = function(onlineNum, offlineNum) {
		if (users.online.data.length == 0) {
			return;
		}
		var luckyList = [];
		var iStart = users.online.pCount;
		var idx;
		var iFlag = false;
		for (var i = iStart; i < iStart + onlineNum; i++) {
			idx = i;
			users.online.pCount++;
			if (users.online.pCount >= users.online.random.length) {
				users.online.pCount = 0;
				iFlag = true;
			}
			if (i >= users.online.random.length) {
				idx = i - users.online.random.length;
			}
			luckyList.push(users.online.data[users.online.random[idx]]);
		}

		iStart = users.offline.pCount;
		for (i = iStart; i < iStart + offlineNum; i++) {
			idx = i;
			users.offline.pCount++;
			if (users.offline.pCount >= users.offline.random.length) {
				users.offline.pCount = 0;
				iFlag = true;
			}
			if (i >= users.offline.random.length) {
				idx = i - users.offline.random.length;
			}
			luckyList.push(users.offline.data[users.offline.random[i]]);
		}

		if (iFlag) {
			randomUserList();
		}
		return luckyList;
	};
	return {
		init: getUserList,
		reset: randomUserList,
		lottery: doDraw
	};
})();

var app = (function() {
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

	var getQuestionTitle = function(type, idx) {
		var question = questionList[type][idx];
		var obj = {
			question: question.question,
			answer: question.answer
		};

		if (typeof question.type != 'undefined') {
			vm.questionType = question.type;
			vm.src = question.src;
		}

		return obj;
	};

	var elQuestionList = {
		template: '#el-questionlist',
		props: ['classlist', 'namelist'],
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
				vm.isDraw = false;
			}
		}
	};

	var flvPlayer;
	var elMask = {
		template: '#el-mask',
		props: ['type', 'showmask', 'src'],
		methods: {
			hideMask: function() {
				vm.showMask = false;
				if (vm.questionType == qsType.VIDEO) {
					flvPlayer.pause();
				}
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

	var drawItvl;

	var vm = new Vue({
		el: '#app',
		components: {
			'el-question': elQuestion,
			'el-questionlist': elQuestionList,
			'el-mask': elMask
		},
		data: {
			on: true,
			isDraw: false,
			typeID: 0,
			type: typeList[0],
			question: {},
			questionType: qsType.NONE,
			src: '',
			showMask: false,
			classlist: arr[0],
			nameList: [],
			luckyList: [],
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
				this.nameList = [];
				if (this.typeID == 7) {
					for (var i = 0; i < 17; i++) {
						this.nameList.push(questionList[7][i].user);
					}
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

				if (vm.questionType == qsType.NONE) {
					return;
				}

				this.showMask = true;
				this.questionType = vm.questionType;
				if (vm.questionType == qsType.VIDEO) {
					//还未响应，需在下一时钟周期触发
					vm.$nextTick(function() {
						if (flvjs.isSupported()) {
							var videoElement = document.getElementById('videoElement');
							flvPlayer = flvjs.createPlayer({
								type: 'flv',
								cors: true,
								url: vm.src
							});
							flvPlayer.attachMediaElement(videoElement);
							flvPlayer.load();
							flvPlayer.play();
						}
					});
				}
			},
			goback: function() {
				this.question.showAnswer = false;
				this.on = true;
				this.questionType = qsType.NONE;
				if (timeItvl) {
					clearInterval(timeItvl);
				}
				this.isDraw = false;
				this.type = typeList[this.typeID];
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
			},
			startLottery: function() {
				this.type = '中奖人信息';
				this.isDraw = true;
			},
			stopLottery: function() {
				if (typeof drawItvl != 'undefined') {
					clearInterval(drawItvl);
				}
			},
			lottery: function(n) {
				this.isDraw = true;
				vm.luckyList = [];
				vm.stopLottery();
				drawItvl = setInterval(function() {
					vm.luckyList = draw.lottery(3, n == 5 ? 2 : 0);
				}, 100);
			}
		}
	});
	return {
		vm: vm
	};
})();

$(function() {
	$('.content').height($(document).height());
	draw.init();
});