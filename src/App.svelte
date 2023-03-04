<script>
	export let name;

	import * as chrono from 'chrono-node';

	const shortHandDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
	const dayRegex = /mon|tue|wed|thu|fri|sat|sun/;
	const customChrono = chrono.casual.clone();
	
	let textValue = '';
	let minHour = 9;
	let maxHour = 22;
	let availableTimes = {};
	for (let i = 0; i < 7; i++) {
		availableTimes[i] = [];
	}

	// Testing with:
	// monday 9-10am, 11-1pm, 5:30-6:30pm, 7:30-8:30pm, tuesday all day, wednesday except 2-3pm and 4-5pm, thursday 9-7pm
	

	// Refine parser for larger hour before smaller hour
	// E.g. 11-2pm = 11am-2pm
	customChrono.refiners.push({
	    refine: (context, results) => {
	        results.forEach((result) => {
	        	if ('start' in result && 'end' in result && result.end != null && result.start.get('hour') > result.end.get('hour')) {
	        		console.log('changing meridiem');
	            	result.start.assign('meridiem', 0);
	            	result.start.assign('hour', result.start.get('hour') % 12);
	            	result.end.assign('meridiem', 1);
	            	result.end.assign('hour', result.end.get('hour') % 12 + 12);
	            };
	        });
	        return results;
	    }
	});

	function showTopNTimes(allUserTimes, N) {

	};

	function handleInput() {

		let text = textValue;

		text = text.toLowerCase();
		text = text.replace(';', ':');

		// Break input text into multiple lines where each line starts with a day (Monday, Tuesday, etc.)
		let indicesOfDays = []
		shortHandDays.forEach((day) => {
			text = text.replace(day, '\n' + day);
		});
		
		// Split lines
		let lines = text.split('\n');

		// Reset available times
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
				console.log(parsed);
				let weekday = parsed[i].start.date().getDay();

				let date = parsed[i].start.date();
				let startHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), minHour);
				let endHourDate;
				for (let i = 0; i < availableTimes[weekday].length; i++) {
					endHourDate = availableTimes[weekday][i][0];
					availableTimes[weekday][i][0] = startHourDate;
					startHourDate = availableTimes[weekday][i][1];
					availableTimes[weekday][i][1] = endHourDate;
				}

				endHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), maxHour);
				availableTimes[weekday].push([startHourDate, endHourDate]);
			};
			console.log(availableTimes);
			return availableTimes;
		}
	};
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