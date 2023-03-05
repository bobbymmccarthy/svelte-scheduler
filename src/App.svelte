<script>
	export let name;

	import * as chrono from 'chrono-node';

	const shortHandDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	const dayRegex = /mon|tue|wed|thu|fri|sat|sun/;
	const customChrono = chrono.casual.clone();
	
	let textValue = '';
	let minHour = 9;
	let maxHour = 22;
	let minMeetingLengthMinutes = 30;
	let minTimeBlockMin = 15;

	// Test texts
	let text1 = "monday 9-10am, 11-1pm, 5:30-6:30pm, 7:30-8:30pm, tuesday all day, wednesday except 2-3pm and 4-5pm, thursday 9-7pm";
	let text2 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:30pm-3:30pm, thursday all day";
	let text3 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:45pm-3:30pm, thursday all day";

	// Refine parser for larger hour before smaller hour
	// E.g. 11-2pm = 11am-2pm
	customChrono.refiners.push({
	    refine: (context, results) => {
	        results.forEach((result) => {
	        	if ('start' in result && 'end' in result && result.end != null && result.start.get('hour') > result.end.get('hour')) {
	            	result.start.assign('meridiem', 0);
	            	result.start.assign('hour', result.start.get('hour') % 12);
	            	result.end.assign('meridiem', 1);
	            	result.end.assign('hour', result.end.get('hour') % 12 + 12);
	            };
	        });
	        return results;
	    }
	});

	// Take a list of [{user, availableTimes}, ...] and returns a single sharedCalendar dictionary of the form {day: {'hour-min': ["user1", "user2", ...], ...}, ...}
	// the key for 9am would be '9-0', for 9:15am would be '9-15', for 9pm woul be '22-0'
	function createSharedCalendar(allUserTimes) {

		let sharedCalendar = {};
		for (let d = 0; d < 7; d++) {
			sharedCalendar[d] = {}
			for (let h = minHour; h < maxHour; h++) {
				for (let m = 0; m < 60; m+=15) {
					sharedCalendar[d][h+'-'+m] = []
				};
			};
		};

		allUserTimes.forEach(obj => {
			let user = obj['user'];
			let availableTimes = obj['availableTimes'];
			for (const [day, availableBlocks] of Object.entries(availableTimes)) {
			  availableBlocks.forEach(block => {
			  	let startHour = block[0].getHours();
			  	let endHour = block[1].getHours();

			  	for (let h = startHour; h <= endHour; h++) {

			  		let startMin = (h != startHour) ? 0 : block[0].getMinutes();
			  		let endMin = (h != endHour) ? 60 : block[1].getMinutes();

			  		for (let m = startMin; m < endMin; m+=15) {
			  			sharedCalendar[day][h+'-'+m].push(user);
			  		};
			  	};

			  });
			};
		});

		console.log(sharedCalendar);
		return sharedCalendar;
	};

	// Take a list of availableTime dictionaries and returns a sorted list of shared available time windows at least minMeetingLengthMinutes long
	function showTopNTimes(allUserTimes, N) {
		sharedTimes = {};

	};


	// Takes text and processes it into a dictionary of available times for each day of the week: {0: [[sun-datetimestart1, sun-datetimeend1], [sun-datetimestart2, sun-datetimeend2]], 1: [], ... 6: []}
	function processText(text) {
		text = text.toLowerCase();
		text = text.replace(';', ':');

		// Break input text into multiple lines where each line starts with a day (Monday, Tuesday, etc.)
		let indicesOfDays = []
		shortHandDays.forEach((day) => {
			text = text.replace(day, '\n' + day);
		});
		
		// Split lines
		let lines = text.split('\n');

		// Set empty available times
		let availableTimes = {};
		for (let i = 0; i < 7; i++) {
			availableTimes[i] = [];
		};

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			let parsed = null;
			const fullAvailability =/all day|anytime|any time|whenever/
			const busyIndicator = /except|besides|apart/

			// If a full day is mentioned
			// e.g. Monday all day
			if (fullAvailability.test(line) && !busyIndicator.test(line)) {
				parsed = chrono.parse(line, undefined, { forwardDate: true });
				if (parsed.length > 0) {
					let date = parsed[0].start.date();
					availableTimes[parsed[0].start.get('weekday')] = [[new Date(date.getYear(), date.getMonth(), date.getDay(), minHour), new Date(date.getYear(), date.getMonth(), date.getDay(), maxHour)]];
				};
			}

			// Handle single or multiple times for day
			// e.g. Monday 8-9am, 1-2pm, 3-4pm
			else {

				// forwardDate (sets to only dates in the future) not working! no biggie for now because we are relying on day of week (0,1,2,3,4,5,6) for rendering, not dates (2/27 vs 3/6)

				parsed = customChrono.parse(line, undefined, { forwardDate: true });
				for (let i = 0; i < parsed.length; i++) {
					if (!dayRegex.test(parsed[i]) && i > 0) {
						parsed[i].start.assign('day', parsed[i-1].start.get('day'));
						parsed[i].start.assign('month', parsed[i-1].start.get('month'));

						if ('end' in parsed[i] && parsed[i].end != null) {
							parsed[i].end.assign('day', parsed[i-1].start.get('day'));
							parsed[i].end.assign('month', parsed[i-1].start.get('month'));
						}
					}

					if ('start' in parsed[i] && 'end' in parsed[i] && parsed[i].end != null) {
						availableTimes[parsed[i].start.date().getDay()].push([parsed[i].start.date(), parsed[i].end.date()]);
					};
				};

			};

			// If they are free except for the times listed, invert the time blocks for that day
			// e.g. Monday except 2-3pm

			if (busyIndicator.test(line)) {
				let weekday = parsed[0].start.date().getDay();

				let date = parsed[0].start.date();
				let startHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), minHour);
				let endHourDate;
				for (let i = 0; i < availableTimes[weekday].length; i++) {
					endHourDate = availableTimes[weekday][i][0];
					availableTimes[weekday][i][0] = startHourDate;
					startHourDate = availableTimes[weekday][i][1];
					availableTimes[weekday][i][1] = endHourDate;
				};

				endHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), maxHour);
				availableTimes[weekday].push([startHourDate, endHourDate]);
			};
		};
		console.log(availableTimes);
		return availableTimes;
	};

	function handleInput() {
		let text = textValue;
		return processText(text);
	};

	// Testing
	let available1 = processText(text1);
	let available2 = processText(text2);
	let available3 = processText(text3);
	let allUserTimes = [{user: 'user1', availableTimes: available1}, {user: 'user2', availableTimes: available2}, {user: 'user3', availableTimes: available3}];
	createSharedCalendar(allUserTimes);
	
</script>

<main>
	<h1>Hello</h1>
	<h2>When are you available to meet?</h2>
	<br>
	<textarea bind:value={textValue} on:input={handleInput} placeholder="tues before 2pm,
wed all day,
thurs 1-2pm, 4-4:30pm,
..."></textarea>
	</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	textarea {
		height: 200px;
		width: 400px;
		padding-bottom: 150px;
	}
</style>