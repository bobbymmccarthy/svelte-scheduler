<script>
	import VoiceRecognition from './components/VoiceRecognition.svelte'
	import {processText, getTopNIntervals} from './helpers.js';
	import Table from './components/Table.svelte'
	const dayArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

	let name = '';
	let text = '';
	let availableTimes = null;

	// If you want to reset database, uncomment this line and run app
	// localStorage.clear();

	let topIntervals = getTopNIntervals(getAllUserTimes(), 5);
	console.log(topIntervals);
	let topTimesText = topTimesToText(topIntervals);

	function topTimesToText(topIntervals) {
		let topTimesText = [];
		topIntervals.forEach((interval) => {
			let day = interval['start'][0];
			let startMin = interval['start'][2];
			let startTime = interval['start'][1] + ':' + (startMin == 0 ? '00' : startMin.toString());
			let endMin = interval['end'][2];
			let endTime = interval['end'][1] + ':' + (endMin == 0 ? '00' : endMin.toString());
			let numUsers = interval['users'].size;
			let users = Array.from(interval['users']).join(', ')

			topTimesText.push({day: day, startTime: startTime, endTime: endTime, numUsers: numUsers, users: users})
		});
		return topTimesText;
	};

	// let timeArr = Array(13 * 4).fill(0).map(() => Array(7).fill(0));

	function handleInput() {
		availableTimes = processText(text);
	};

	function submit() {
		availableTimes = processText(text);
		const userID = localStorage.length;
		let userData = {id: userID, name: name, availableTimes: availableTimes};
		localStorage.setItem(userID, JSON.stringify(userData));
		topTimesText = topTimesToText(getTopNIntervals(getAllUserTimes(), 5));
		name = '';
		text = '';
	};

	function getAllUserTimes() {
		let userTimes = [];
		for (let i = 0; i < localStorage.length; i++) {
	      	userTimes.push(JSON.parse(localStorage.getItem(i)));
        };

		console.log(userTimes);
        return userTimes;
	};

</script>

<main>
	<h1>Speech 'n' Text Scheduler 🎤💻</h1>
	<article class="cf">
		<div class="input-side">
			<h2>Name?</h2>
			<input bind:value={name}>
			<h2>When are you available to meet?</h2>
			<h4><b>Voice Record</b> or <b>Type</b> your availablilty.</h4>
			<p>Start with the <u>day of the week</u> followed by the <i>times</i>.<br>
			<br>For example, I'm free... "<u>Monday</u> <i>9am-10am</i> and <i>11am-12pm</i>, <u>Tuesday</u> <i>except 3-4pm</i>, ..."</p>
			<VoiceRecognition bind:noteContent = {text}></VoiceRecognition>
			<br>
			<textarea bind:value={text} on:input={handleInput} placeholder="mon 9-10am, 2-3:45pm
wed all day,
thurs except 1-2pm,
fri except 3-4pm and 5-6pm
..."></textarea>
			<br><br>
			<input class="submit" type="button" value="Submit" on:click={submit}>
			<br>
		</div>

		<div class="top-times-side">
			<h2>Top Times</h2>
			{#each topTimesText as time}
				<div class = 'top-time'>
					<p>
						<b>{dayArr[time.day]} {time.startTime} - {time.endTime}</b>
						<br>
						<u>{time.numUsers} people</u><br>
						({time.users})
					</p>
				</div>
				<br>
			{/each}
		</div>
	</article>


	<!-- <Table timeArr = {timeArr}></Table> -->
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
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	textarea {
		height: 150px;
		width: 350px;
		padding-bottom: 150px;
	}

	.submit {
		font-size: 1.7em;
	}


	.input-side {
		float: left;
    	_display: inline;
    	width: 100%;
    	background-color: #eee;
	}

	.top-times-side {
		float: left;
		_display: inline;
		width: 100%;
		background-color: #f4f4f4;
	}

	.top-time {
		margin: 0% 10%;
	}

	@media screen and (min-width: 30em) {
    .input-side {
	        width: 70%;
	    }
	.top-times-side {
			width: 30%;
		}
	}

	.cf:before, .cf:after {
    content: " ";
    display: table;
	}

	.cf:after {
	    clear: both;
	}

	.cf {
	    *zoom: 1;
	}

</style>