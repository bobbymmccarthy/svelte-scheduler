<script>
	import VoiceRecognition from './components/VoiceRecognition.svelte'
	import Table from './components/Table.svelte'


	// Test texts
	let text1 = "monday 9-10am, 11-1pm, 5:30-6:30pm, 7:30-8:30pm, tuesday all day, wednesday except 2-3pm and 4-5pm, thursday 9-7pm";
	let text2 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:30pm-3:30pm, thursday all day";
	let text3 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:45pm-3:30pm, thursday all day";

	function handleInput() {
		let text = typedText;
		return processText(text);
	};

	let voice = ""
	let voiceText = ""
	let timeArr = Array(24).fill(0).map(() => Array(7).fill(0));

</script>

<main>
	<VoiceRecognition bind:noteContent = {voice}></VoiceRecognition>
	<p>from Binding: {voice}</p>
	<Table timeArr ={timeArr}></Table>
	<h1>Hello</h1>
	<h2>When are you available to meet?</h2>
	<br>
	<textarea bind:value={voiceText} on:input={handleInput} placeholder="mon 9-10am, 2-3:45pm
wed all day,
thurs except 1-2pm,
fri except 3-4pm and 5-6pm
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