"use strict";

var nicerTodoyu = nicerTodoyu || {};
nicerTodoyu.search = nicerTodoyu.search || {};


/**
 *
 * @param code
 * @private
 */
nicerTodoyu.search._addScript = function (code) {
	var body = document.getElementsByTagName('body')[0];
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.textContent = code;

	body.appendChild(script);
};


/**
 *
 * @param selector
 * @private
 */
nicerTodoyu.search._toggleTasks = function (selector) {
	var self = this;
	var $tasks = $('#tasks').find(selector);

	$tasks.each(function (i) {
		var $this = $(this);
		var id = $this.attr('id').match(/task-(\d*)/)[1];

		self._addScript("setTimeout(function(){window.Todoyu.Ext.project.Task.toggleDetails(" + id + ")}, " + (i * 333) + ");");
	});
};


/**
 *
 */
nicerTodoyu.search.openTasks = function () {
	this._toggleTasks('.task:not(".expanded")');
};


/**
 *
 */
nicerTodoyu.search.closeTasks = function () {
	this._toggleTasks('.task.expanded');
};


/**
 *
 */
nicerTodoyu.search.openTimeTab = function () {
	var $tasks = $('#tasks').find('.task');

	$tasks.each(function (i) {
		var $this = $(this);
		var id = $this.attr('id').match(/task-(\d*)/)[1];

		setTimeout(function () {
			$this.find('#task-' + id + '-tab-timetracking-label').trigger('click');
		}, (i * 333));
	});
};

/**
 * in: 12:50:15
 * out: 770
 *
 * @param str
 * @returns string
 * @private
 */
nicerTodoyu.search._timeStringToMinutes = function (str) {
	return str.split(':').reduce(function (prev, cur, index) {
		if (index == 0) {
			return prev + (parseInt(cur) * 60);
		}
		if (index == 2) {
			return prev;
		}
		return prev + parseInt(cur);
	}, 0);
};


/**
 *
 * @returns {{}}
 */
nicerTodoyu.search.loadData = function () {
	var body = document.getElementsByTagName('body')[0];
	var $Tasks = $('#tasks');
	var $tasks = $Tasks.find('.task');
	var tasks = [];

	if ($tasks.length !== $tasks.find('.details').length) {
		return {error: "Please open all tasks"};
	}
	if ($tasks.length !== $tasks.find('.timetracks').length) {
		return {error: "Please open all timetrack tabs"};
	}

	$tasks.each(function () {
		var $this = $(this);
		var task = {};
		var text;
		var match;
		var dateMatch;

		// task nr
		task['id'] = $this.find('.taskNumber').text();

		// task status
		task['status'] = $this.attr('class').match(/ status([A-Z][a-z]+)/)[1];

		// expected time
		text = $this.find('.right.properties').text().replace(/\s+/g, ' ').trim();
		match = text.match(/Aufwand geschätzt (\d+:\d+)/);
		task['timeExpected'] = nicerTodoyu.search._timeStringToMinutes(match[1]);

		// currently used time
		task['timeUsedTotal'] = nicerTodoyu.search._timeStringToMinutes($this.find('.trackedTime .time').text());

		// currently used time by person and date
		task['timeUsed'] = [];
		$this.find('.tracksList').find('li').each(function () {
			var $this = $(this);
			task['timeUsed'].push({
				time: nicerTodoyu.search._timeStringToMinutes($this.find('.trackedTime').text()),
				person: $this.find('.quickInfoPerson').text(),
				date: $this.find('.date').text()
			})
		});

		// finish date
		dateMatch = text.match(/Abgeschlossen (\d+\.\d+\.\d+)/);
		task['finishedDate'] = dateMatch ? dateMatch[1] : "";

		tasks.push(task);
	});

	return {data: tasks};
};

/**
 *
 */
nicerTodoyu.search.init = function () {
	if ($('#todoyu-search').length) {
		var $widgetArea = $('#widget-area');
		var $tmp;
		$tmp = $('<button>open tasks</button>');
		$tmp.insertAfter($widgetArea);
		$tmp.on('click', nicerTodoyu.search.openTasks.bind(this));

		$tmp = $('<button>close tasks</button>');
		$tmp.insertAfter($widgetArea);
		$tmp.on('click', nicerTodoyu.search.closeTasks.bind(this));

		$tmp = $('<button>open time track tab</button>');
		$tmp.insertAfter($widgetArea);
		$tmp.on('click', nicerTodoyu.search.openTimeTab.bind(this));

		$tmp = $('<button id="makeBurndown">draw burndown</button>');
		$tmp.insertAfter($widgetArea);
		$tmp.on('click', nicerTodoyu.search.makeTheBurndown.bind(this));

		var $burndownDaysInput = $('<input type="text" id="burndownDaysInput" style="width: 400px">');
		$burndownDaysInput.insertAfter($widgetArea);

		chrome.storage.local.get(function (result) {

			if (result['burndownDays']) {
				$burndownDaysInput.val(result['burndownDays']);
			} else {
				$burndownDaysInput.val('0.5,1,1,1,1');
				chrome.storage.local.set({burndownDays: '0.5,1,1,1,1'});
			}
		});

		var $burndownDaysInput2 = $('<input type="text" id="burndownDaysInput2" style="width: 400px">');
		$burndownDaysInput2.insertAfter($widgetArea);

		chrome.storage.local.get(function (result) {

			if (result['burndownDays2']) {
				$burndownDaysInput2.val(result['burndownDays2']);
			} else {
				$burndownDaysInput2.val('01.01.10');
				chrome.storage.local.set({burndownDays2: '01.01.10'});
			}
		});

		$tmp = $('<button id="burndownDaysSave">Save days settings</button>');
		$tmp.insertAfter($widgetArea);
		$tmp.on('click', nicerTodoyu.search.saveDaysSetting.bind(this));
	}
};

/**
 *
 */
nicerTodoyu.search.saveDaysSetting = function () {
	var val = $('#burndownDaysInput').val();
	chrome.storage.local.set({burndownDays: val});
	var val2 = $('#burndownDaysInput2').val();
	chrome.storage.local.set({burndownDays2: val2});
};

/**
 *
 * @param tasks
 * @param type
 * @returns {*[]}
 * @private
 */
nicerTodoyu.search._getSumOfType = function (tasks, type) {
	return [tasks.filter(function (task) {
		return task.status == type;
	}).reduce(function (prev, cur) {
		return prev + parseInt(cur.timeExpected);
	}, 0) / 60];
};


/**
 *
 * @param array
 * @param field
 * @returns {*}
 * @private
 */
nicerTodoyu.search._sum = function (array, field) {
	var total;

	return array.reduce(function (prev, cur) {
		return prev + (field ? cur[field] : cur);
	}, 0)
};

/**
 *
 */
nicerTodoyu.search.makeTheBurndown = function () {
	var self = this;
	self.data = {};
	var $chart = $('#burndownchart');
	if (!$chart.length) {
		$chart = $("<div id='burndownchart'></div>");
		$chart.insertAfter($('#widget-area'));
		$chart.css({
			width: '900px',
			height: '480px'
		});
	}

	var data = nicerTodoyu.search.loadData();

	if (data.error) {
		alert(data.error);
		return;
	}

	// Set our data
	self._setData(data.data);

	var chart = echarts.init($chart[0]);

	console.log(self.data);

	chart.setOption({
		title: {
			text: 'Burndown Ding',
			subtext: 'Cool oder'
		},
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: [
				'Geschätzte Stunden',
				'Geleistete Stunden',
				'Abgeschlossene Tasks',
				'Geschätzt + Unterschiede'
			]
		},
		toolbox: {
			show: true,
			feature: {
				restore: {show: true},
				saveAsImage: {show: true}
			}
		},
		calculable: true,
		xAxis: [
			{
				type: 'category',
				boundaryGap: false,
				data: self.data.dayLabels
			}, {
				type: 'category',
				data: ['foo']
			}
		],
		yAxis: [
			{
				type: 'value',
				axisLabel: {
					formatter: '{value} h'
				}
			}
		],
		series: [
			{
				name: 'Done',
				type: 'bar',
				stack: 'task',
				xAxisIndex: 1,
				data: nicerTodoyu.search._getSumOfType(self.data.tasks, "Done"),
				itemStyle: {
					normal: {
						color: 'rgba(0,255,0,0.3)'
					}
				}
			},
			{
				name: 'Confirm',
				type: 'bar',
				stack: 'task',
				xAxisIndex: 1,
				data: nicerTodoyu.search._getSumOfType(self.data.tasks, "Confirm"),
				itemStyle: {
					normal: {
						color: 'rgba(255,255,0,0.3)'
					}
				}
			},
			{
				name: 'Progress',
				type: 'bar',
				stack: 'task',
				xAxisIndex: 1,
				data: nicerTodoyu.search._getSumOfType(self.data.tasks, "Progress"),
				itemStyle: {
					normal: {
						color: 'rgba(255,170,0,0.3)'
					}
				}
			},
			{
				name: 'Open',
				type: 'bar',
				stack: 'task',
				xAxisIndex: 1,
				data: nicerTodoyu.search._getSumOfType(self.data.tasks, "Open"),
				itemStyle: {
					normal: {
						color: 'rgba(255,0,0,0.3)'
					}
				}

			},
			{
				name: 'Geschätzte Stunden',
				type: 'line',
				data: self.data.should.map(function (min) {
					return min / 60
				})
			},
			{
				name: 'Abgeschlossene Tasks',
				type: 'line',
				data: self.data.doneTaskTime.map(function (min) {
					return min / 60
				})
			},
			{
				name: 'Geleistete Stunden',
				type: 'line',
				data: self.data.is.map(function (min) {
					return min / 60
				})
			},
			{
				name: 'Geschätzt + Unterschiede',
				type: 'line',
				data: self.data.shouldWithOvertime.map(function (min) {
					return min / 60
				})
			}
		]
	})
};


/**
 *
 * @param data
 * @private
 */
nicerTodoyu.search._setData = function (data) {
	var self = this;
	// We start collecting our data
	self.data.tasks = data;

	var minDate = new Date("20" + $('#burndownDaysInput2').val().split(".").reverse().join("."));

	self.data.tasks = self.data.tasks.map(function(item){

		item.timeUsed = item.timeUsed.filter(function(subitem){
			var myDate = new Date("20" + subitem.date.split(".").reverse().join("."));
			return myDate >= minDate;
		});
		return item;
	});


	console.log(self.data.tasks);

	// First, we count a week total of all times
	self.data.weekTotal = {};
	self.data.weekTotal.timeExpected = self._sum(self.data.tasks, "timeExpected");
	self.data.weekTotal.timeUsed = self._sum(self.data.tasks, "timeUsed");

	// We then filter finished tasks because they have more data (a completion date)
	self.data.doneTasks = self.data.tasks.filter(function (task) {
		return task.status == "Done" || task.status == "Accepted";
	});

	// Read what days self sprint has
	self.data.days = $('#burndownDaysInput').val().split(',');

	// Count the total ammount of bananas that we have used up to day x
	self.data.daysSubtotal = self.data.days.map(function (e, i) {
		// sum of the first i+1 elements
		return self.data.days.slice(0, i + 1).reduce(function (cur, prev) {
			return prev - (-parseFloat(cur));
		})
	}, 0);

	// The ammount of bananas we have in total in self sprint
	self.data.daysTotal = self.data.daysSubtotal[self.data.daysSubtotal.length - 1];

	// variables which wil later data by day, not by task
	self.data.daysObject = {};

	// Loop over tasks and add the data to the days
	self.data.tasks.forEach(function (task) {
		task.timeUsed.forEach(function (track) {
			track.task = task.id;
			self.data.daysObject[track.date] = self.data.daysObject[track.date] || {};
			self.data.daysObject[track.date].tracks = self.data.daysObject[track.date].tracks || [];
			self.data.daysObject[track.date].tracks.push(track);
		})
	});

	// Transform the object which contains the days to an array
	self.data.daysArray = Object.keys(self.data.daysObject).map(function (key) {
		self.data.daysObject[key].date = key;
		return self.data.daysObject[key];
	}).sort(function (a, b) {
		return a.date > b.date ? 1 : -1;
	});

	var taskDoneSubtotal = 0;
	self.data.daysArray.forEach(function (day) {
		self.data.doneTasks.forEach(function (task) {
			if (task.finishedDate.replace('2015', '15') == day.date) { // TODO: HACK
				taskDoneSubtotal += task.timeExpected;
			}
		});
		day.finishedTime = taskDoneSubtotal;
		day.totalTime = day.tracks.reduce(function (prev, cur) {
			return prev + parseInt(cur.time);
		}, 0)
	});

	self.data.should = self.data.daysSubtotal.map(function (day) {
		return self.data.weekTotal.timeExpected * (day) / self.data.daysTotal;
	});
	self.data.should.unshift(0);


	var totalIs = 0;
	self.data.is = self.data.daysArray.map(function (day) {
		totalIs += parseInt(day.totalTime);
		return totalIs;
	});
	self.data.is.unshift(0);

	self.data.doneTaskTime = [0];
	self.data.daysArray.forEach(function (day) {
		self.data.doneTaskTime.push(day.finishedTime);
	});

	var timeWithOvertime = self.data.weekTotal.timeExpected;
	self.data.doneTasks.forEach(function (task) {
		timeWithOvertime += task.timeUsedTotal - task.timeExpected;
	});

	self.data.shouldWithOvertime = self.data.daysSubtotal.map(function (day) {
		return timeWithOvertime * (day) / self.data.daysTotal;
	});
	self.data.shouldWithOvertime.unshift(0);

	self.data.dayLabels = self.data.days.map(function (e, i) {
		if (i == 0) {
			return "Sprintstart";
		}
		return "Nach Tag " + i;
	});
	self.data.dayLabels.push('Sprintende');
};
