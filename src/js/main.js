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
		var sportid = 5; //两学一做
		// sportid = 4; //人大选举
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
			vm.multiMediaStart = 0;
			if (question.start != 'undefined') {
				vm.multiMediaStart = question.start;
			}
		}

		return obj;
	};

	var elQuestionList = {
		template: '#el-questionlist',
		props: ['classlist', 'namelist'],
		methods: {
			selectQuestion: function(idx) {
				vm.classlist[idx] = true;
				//this.$message('选择了第' + idx + '题');
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
				vm.isDraw = 0;
			}
		}
	};

	var elMask = {
		template: '#el-mask',
		props: ['type', 'showmask', 'src'],
		methods: {
			hideMask: function() {
				vm.showMask = false;
				if (vm.questionType == qsType.VIDEO) {
					vm.flvPlayer.pause();
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
	var chartItvl;
	var drawItvl;

	function launchFullscreen(element) {
		//此方法不可以在異步任務中執行，否則火狐無法全屏
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		} else if (element.oRequestFullscreen) {
			element.oRequestFullscreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullScreen();
		} else {
			var docHtml = document.documentElement;
			var docBody = document.body;
			var videobox = document.getElementById('videobox');
			var cssText = 'width:100%;height:100%;overflow:hidden;';
			docHtml.style.cssText = cssText;
			docBody.style.cssText = cssText;
			videobox.style.cssText = cssText + ';' + 'margin:0px;padding:0px;';
			document.IsFullScreen = true;
		}
	}

	var vm = new Vue({
		el: '#app',
		components: {
			'el-question': elQuestion,
			'el-questionlist': elQuestionList,
			'el-mask': elMask
		},
		data: {
			on: true,
			isDraw: 0,
			typeID: 0,
			flvPlayer: '',
			type: typeList[0],
			question: {},
			questionType: qsType.NONE,
			src: '',
			multiMediaStart: 0,
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
			},
			isDraw: function(val) {
				if (val == 2) {
					vm.$nextTick(function() {
						this.renderChart();
					});
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
			renderChart: function() {
				var dom = document.getElementById("chart");
				var myChart = echarts.init(dom);

				var gb = {
					colors: {
						white: "#FFF",
						whiteMedium: "rgba(255, 255, 255, 0.6)",
						whiteMediumLight: "rgba(255, 255, 255, 0.3)",
						whiteLight: "rgba(255, 255, 255, 0.2)",
						whiteLighter: "rgba(255, 255, 255, 0.1)",
						primary: "#556fb5",
						primaryLight: "#889acb"
					}
				};
				var getOption = function(data) {
					var option = {
						color: ['rgba(253,224,62,0.8)'],
						"grid": {
							"borderWidth": 0,
							"x": 20,
							"y": 20,
							"x2": 20,
							"y2": 100
						},
						tooltip: {},
						xAxis: [{
							type: 'category',
							data: [],
							axisLine: {
								show: 0
							},
							axisTick: {
								show: 0
							},
							boundaryGap: 0,
							axisLabel: {
								textStyle: {
									color: gb.colors.white,
									fontSize: 18
								},
								formatter: function(param, i) {
									return param.split('').join('\n');

								}
							},
							splitLine: {
								show: false
							}
						}],
						yAxis: [{
							type: 'value',
							splitLine: {
								show: !0,
								lineStyle: {
									type: "dashed",
									color: gb.colors.whiteLight
								}
							},
							axisLine: {
								show: 0
							},
							axisTick: {
								show: 0
							},
							boundaryGap: 0,
							axisLabel: {
								show: 0
							}
						}],
						series: [{
							name: '得分',
							type: "bar",
							barMaxWidth: 40,
							areaStyle: {
								normal: {
									color: gb.colors.whiteMediumLight
								}
							},
							lineStyle: {
								normal: {
									width: 1
								}
							},
							data: [],
							itemStyle: {
								normal: {
									//color: gb.colors.whiteMedium,
									width: 1,
									label: {
										show: true,
										textStyle: {
											fontSize: 20,
											color: gb.colors.white
										},
										position: 'top',
										//formatter: '{b}\n{c}\n'
									},
									barBorderRadius: 2
								}
							},
							animationEasing: 'cubicInOut',
							animationEasingUpdate: 'cubicInOut',
							animationDelay: function(idx) {
								return idx * 50;
							},
							animationDelayUpdate: function(idx) {
								return idx * 100;
							}
						}]
					};
					data.map(function(item) {
						option.xAxis[0].data.push(item.user);
						option.series[0].data.push(parseFloat(item.num).toFixed(0));
					});

					return option;
				};

				var refreshData = function() {
					var url = 'http://cbpc540.applinzi.com/index.php?s=/addon/GoodVoice/GoodVoice/qualityHrOnlineScore';
					$.ajax({
							url: url,
							async: false,
							dataType: "jsonp",
							callback: "JsonCallback"
						})
						.done(function(obj) {
							var option = getOption(obj);
							myChart.setOption(option);
						});
				};
				refreshData();
				chartItvl = setInterval(function() {
					refreshData();
				}, 3000);

			},
			lightoff: function() {

				if (vm.questionType == qsType.NONE) {
					return;
				}

				this.showMask = true;
				this.questionType = vm.questionType;
				if (this.questionType == qsType.VIDEO) {
					//还未响应，需在下一时钟周期触发
					this.$nextTick(function() {
						var type = this.src.split('.')[2];
						// if (type == 'mp4') {
						// 	this.flvPlayer = document.getElementById('videoElement');
						// 	this.flvPlayer.src = this.src;
						// 	this.flvPlayer.load();
						// 	this.flvPlayer.play();
						// 	this.flvPlayer.currentTime = this.multiMediaStart;
						// 	launchFullscreen(this.flvPlayer);
						// 	//this.flvPlayer.webkitRequestFullScreen();
						// 	return;
						// }
						if (flvjs.isSupported()) {
							var videoElement = document.getElementById('videoElement');
							if (type == 'MP4') {
								this.flvPlayer = videoElement;
								this.flvPlayer.src = this.src;
								this.flvPlayer.load();
								this.flvPlayer.currentTime = this.multiMediaStart;
								launchFullscreen(videoElement);
								this.flvPlayer.play();
							} else {
								this.flvPlayer = flvjs.createPlayer({
									type: type,
									url: this.src
								});
								this.flvPlayer.attachMediaElement(videoElement);
								this.flvPlayer.load();
								this.flvPlayer.play();
								launchFullscreen(videoElement);
								videoElement.currentTime = this.multiMediaStart;
								//document.getElementById('videoElement').webkitRequestFullScreen();
							}
							// if (type == 'mp4') {
							// 	this.flvPlayer.currentTime = this.multiMediaStart;
							// }

							// setTimeout(function() {
							// 	this.flvPlayer.currentTime = this.multiMediaStart;
							// }, 4000);
						}
					});
				}
			},
			goback: function() {
				this.question.showAnswer = false;

				if (this.questionType == qsType.VIDEO && this.flvPlayer != "") {
					if (this.src.split('.')[2] == 'flv') {
						this.flvPlayer.pause();
						this.flvPlayer.unload();
						this.flvPlayer.detachMediaElement();
						this.flvPlayer.destroy();
					} else {
						this.flvPlayer.pause();
					}
				}

				this.on = true;

				this.questionType = qsType.NONE;
				if (timeItvl) {
					clearInterval(timeItvl);
				}
				if (drawItvl) {
					clearInterval(drawItvl);
				}
				if (chartItvl) {
					clearInterval(chartItvl);
				}
				this.isDraw = 0;
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
						_self.showMask = false;
					}
				}, 1000);
			},
			startLottery: function(n) {
				this.type = (n == 1) ? '中奖人信息' : '得分排名';
				this.isDraw = n;
				this.luckyList = [];
			},
			stopLottery: function() {
				if (typeof drawItvl != 'undefined') {
					clearInterval(drawItvl);
				}
			},
			lottery: function(n) {
				this.isDraw = 1;
				this.luckyList = [];
				this.stopLottery();
				drawItvl = setInterval(function() {
					if (n > 2) {
						vm.luckyList = draw.lottery(4, 2);
					} else {
						vm.luckyList = draw.lottery(2, 0);
					}

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