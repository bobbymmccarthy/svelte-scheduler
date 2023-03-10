import * as chrono from 'chrono-node';

const shortHandDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const dayRegex = /mon|tue|wed|thu|fri|sat|sun/;
const customChrono = chrono.casual.clone();
const beforeRegex =/before/
const afterRegex = /after/
const alldayRegex =/all day|anytime|any time|whenever/
const busyRegex = /except|besides|apart/

let MIN_HOUR = 9;
let MAX_HOUR = 22;
let MIN_MEETING_LENGTH_MIN = 30;
let MIN_TIMEBLOCK_MIN = 15;

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

function createEmptyCalendar() {
	let calendar = {}
	for (let d = 0; d < 7; d++) {
		calendar[d] = {}
		for (let h = MIN_HOUR; h < MAX_HOUR; h++) {
			for (let m = 0; m < 60; m+=15) {
				calendar[d][h+'-'+m] = []
			};
		};
	};
	return calendar;
};

// Take a list of [{user, availableTimes}, ...] and returns a single sharedCalendar dictionary of the form {day: {'hour-min': ["user1", "user2", ...], ...}, ...}
// the key for 9am would be '9-0', for 9:15am would be '9-15', for 9pm woul be '22-0'
async function createSharedCalendar(userTimes) {
	console.log({userTimes})
	let userTimesPayload = await userTimes;
	let sharedCalendar = createEmptyCalendar();
	console.log({userTimesPayload})
	userTimesPayload.forEach(obj => {
		if (obj) {
			let user = obj['name'];
			let availableTimes = obj['times'];
			if (availableTimes) {
				for (const [day, availableBlocks] of Object.entries(availableTimes)) {
			  availableBlocks.forEach(block => {
			  	let startHour = (new Date(block[0])).getHours();
			  	let endHour = (new Date(block[1])).getHours();

			  	for (let h = startHour; h <= endHour; h++) {

			  		let startMin = (h != startHour) ? 0 : (new Date(block[0])).getMinutes();
			  		let endMin = (h != endHour) ? 60 : (new Date(block[1])).getMinutes();

			  		for (let m = startMin; m < endMin; m+=15) {
			  			sharedCalendar[day][h+'-'+m].push(user);
			  		};
			  	};

			  });
			};
			};
		};
	});
	console.log({sharedCalendar});
	return sharedCalendar;
};

// function createCalendarFromAvailableTimes(user, availableTimes) {
// 	let calendar = createEmptyCalendar();

// 	for (const [day, availableBlocks] of Object.entries(availableTimes)) {
// 		availableBlocks.forEach(block => {
// 			let startHour = block[0].getHours();
// 			let endHour = block[1].getHours();

// 			for (let h = startHour; h <= endHour; h++) {

// 				let startMin = (h != startHour) ? 0 : block[0].getMinutes();
// 				let endMin = (h != endHour) ? 60 : block[1].getMinutes();

// 				for (let m = startMin; m < endMin; m+=15) {
// 					calendar[day][h+'-'+m].push(user);
// 				};
// 			};
// 		});
// 	};

// 	return calendar;
// };

// Set equality from https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
const eqSet = (xs, ys) =>
xs.size === ys.size &&
[...xs].every((x) => ys.has(x));

function isSuperset(set, subset) {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
};

// Take userTimes and returns a sorted list of the top N shared available time windows at least minMeetingLengthMin long
async function getTopNIntervals(userTimesPromise, N) {
	let userTimes = await userTimesPromise;
	console.log({userTimes})
	let sharedCalendar = await createSharedCalendar(userTimes);
	console.log({sharedCalendar})
	let sharedIntervals = [];
	let ongoingIntervals = new Set();
	let prevUserSet = new Set();

	for (let d = 0; d < 7; d++) {
		for (let h = MIN_HOUR; h <= MAX_HOUR; h++) {
			for (let m = 0; m < 60; m+=15) {
				let cal = await sharedCalendar[d][h+'-'+m]
				// console.log({cal})
				let userSet = new Set(cal);

				// Test if interval is keeping track of a new set of users not already being covered
				let newUserSet = userSet.size >= 1;
				if (newUserSet) {
					ongoingIntervals.forEach(i => {
						if (eqSet(sharedIntervals[i]['users'], userSet)) {
							newUserSet = false;
						};
					});
				};

				// If this is a new set of users not being covered, create an interval
				if (newUserSet) {
					ongoingIntervals.add(sharedIntervals.length);	
					sharedIntervals.push({users: userSet, start: [d, h, m], end: []});
				};

				ongoingIntervals.forEach(i => {
					if (!isSuperset(userSet, sharedIntervals[i].users)) {
						sharedIntervals[i]['end'] = [d, h, m];
						ongoingIntervals.delete(i);
					};
				});
				prevUserSet = userSet;
			};
		};
	};


	sharedIntervals.sort((a, b) => { 
	    let numUserDiff = b['users'].size - a['users'].size;
	    if (numUserDiff != 0) {
	    	return numUserDiff;
	    }
	    else if (a['start']['d'] - b['start']['d'] != 0) {
	    	return a['start']['d'] - b['start']['d'];
	    }
	    else if (a['start']['h'] - b['start']['h'] != 0) {
	    	return a['start']['h'] - b['start']['h'];
	    }
	    else {
	    	return a['start']['m'] - b['start']['m'];
	    };
	    return 0;
	});

	return sharedIntervals.slice(0, N);
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
		console.log(lines[i]);
		let parsed = null;

		// If a full day is mentioned
		// e.g. Monday all day
		if (alldayRegex.test(line) && !busyRegex.test(line)  && !beforeRegex.test(line) && !afterRegex.test(line)) {
			parsed = chrono.parse(line, undefined, { forwardDate: true });
			if (parsed.length > 0) {
				let date = parsed[0].start.date();
				availableTimes[parsed[0].start.get('weekday')] = [[new Date(date.getYear(), date.getMonth(), date.getDay(), MIN_HOUR), new Date(date.getYear(), date.getMonth(), date.getDay(), MAX_HOUR)]];
			};
		}
		
		// Handle single or multiple times for day
		// e.g. Monday 8-9am, 1-2pm, 3-4pm
			// Handle 'before' or 'after'
		else {

			// Now, parse text with custom parser
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
				};

				// There is currently a bug in the parser (not the before/after code below), 
				// that doesn't parse the '4-5pm' in "monday before 11am, from 2-3pm, 4-5pm" correctly
				console.log(parsed);
				// need to check for before/after in the substring between the current parsed item and the previous parsed item.
				if (beforeRegex.test(parsed[i]) || 
						(i > 0 && beforeRegex.test(line.substring(parsed[i-1].index, line.substring(parsed[i].index))))) {
					parsed[i].end = parsed[i].start.clone();
					console.log()
					parsed[i].end.assign('hour', parsed[i].start.get('hour'));
					parsed[i].end.assign('minute', parsed[i].start.get('minute'));
					parsed[i].start.assign('hour', MIN_HOUR);
					parsed[i].start.assign('minute', 0);
				}
				else if (afterRegex.test(line) || 
						(i > 0 && afterRegex.test(line.substring(parsed[i-1].index, line.substring(parsed[i].index))))) {
					parsed[i].end = parsed[i].start.clone();
					parsed[i].end.assign('hour', MAX_HOUR);
					parsed[i].end.assign('minute', 0);
				};


				if ('start' in parsed[i] && 'end' in parsed[i] && parsed[i].end != null) {
					availableTimes[parsed[i].start.date().getDay()].push([parsed[i].start.date(), parsed[i].end.date()]);
				};
			};

		};

		// If they are free except for the times listed, invert the time blocks for that day
		// e.g. Monday except 2-3pm

		if (busyRegex.test(line)) {
			let weekday = parsed[0].start.date().getDay();

			let date = parsed[0].start.date();
			let startHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), MIN_HOUR);
			let endHourDate;
			for (let i = 0; i < availableTimes[weekday].length; i++) {
				endHourDate = availableTimes[weekday][i][0];
				availableTimes[weekday][i][0] = startHourDate;
				startHourDate = availableTimes[weekday][i][1];
				availableTimes[weekday][i][1] = endHourDate;
			};

			endHourDate = new Date(date.getYear(), date.getMonth(), date.getDay(), MAX_HOUR);
			availableTimes[weekday].push([startHourDate, endHourDate]);
		};
	};
	console.log(availableTimes);
	return availableTimes;
};

function makeTimeArr(timeMap){
	console.log('in time array')
	let timeArr = Array(24).fill(0).map(() => Array(7).fill(0));
	for (let i = 0; i<7; i++) {
		for(let j = 0; j<24; j++) {
			console.log(`timeMap ${timeMap[i]}`)
			for (let k = 0; k < timeMap[i].length; k++){
				// console.log(`time Arr[i][k]: ${timeArr[i]}`);
				console.log(timeMap[i][k][0].getHours())
				if (timeMap[i][k][0].getHours() <= j && timeMap[i][k][1].getHours() >= j){
					timeArr[j][i] = true;
				}
			}
		}
		
	}
	return timeArr
}

export {makeTimeArr, processText, createSharedCalendar, getTopNIntervals};
