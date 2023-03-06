<script>
	import VoiceRecognition from './components/VoiceRecognition.svelte'
	import {processText} from './helpers.js';
	import Table from './components/Table.svelte'

	let name = '';
	let text = '';
	let availableTimes = null;
	let timeArr = Array(13 * 4).fill(0).map(() => Array(7).fill(0));

	function handleInput() {
		availableTimes = processText(text);
	};

	function submit() {
		const userID = localStorage.length;
		let userData = {id: userID, name: name, availableTimes: availableTimes};
		localStorage.setItem(userID, JSON.stringify(userData));
		getAllUserTimes();
	};

	function getAllUserTimes() {
		let userTimes = [];
		for (let i = 0; i < localStorage.length; i++) {
	      	userTimes.push(JSON.parse(localStorage.getItem(i)));
        };
        console.log(userTimes)
        return userTimes;
	};

</script>

<main>
	<h1>Group Scheduler</h1>
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
	<br><br>
	<Table timeArr = {timeArr}></Table>
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
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	textarea {
		height: 200px;
		width: 350px;
		padding-bottom: 150px;
	}

	.submit {
		font-size: 1.5em;
	}
</style>