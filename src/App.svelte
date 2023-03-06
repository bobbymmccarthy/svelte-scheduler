<script>
	import VoiceRecognition from './components/VoiceRecognition.svelte'
	import {processText} from './helpers.js';
	import Table from './components/Table.svelte'

	let text = '';
	let timeArr = Array(24).fill(0).map(() => Array(7).fill(0));

	function handleInput() {
		return processText(text);
	};

	function getAllNotes(){
		let notes = [];
    	let key;
    	for (var i = 0; i < localStorage.length; i++) {
      	key = localStorage.key(i);
      	if (key.substring(0, 5) == "note-") {
			notes.push({
			date: key.replace("note-", ""),
			content: localStorage.getItem(localStorage.key(i))
        });
      }
    }
	return notes;
	}
</script>

<main>
	<h1>Group Scheduler</h1>
	<h2>When are you available to meet?</h2>
	<p><b>Voice Record</b> or <b>Type</b> your availablilty.<br>
	  Start with the <u>day of the week</u> followed by the <i>times</i>.<br>
	For example: "I'm free <u>Monday</u> <i>9am-10am</i> and <i>11am-12pm</i>, <u>Tuesday</u> <i>except 3-4pm</i>, ..."</p>
	<VoiceRecognition bind:noteContent = {text}></VoiceRecognition>
	<br>
	<textarea bind:value={text} on:input={handleInput} placeholder="mon 9-10am, 2-3:45pm
wed all day,
thurs except 1-2pm,
fri except 3-4pm and 5-6pm
..."></textarea>
	<Table timeArr ={timeArr}></Table>
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
		width: 400px;
		padding-bottom: 150px;
	}
</style>