<script>
  import Recorder from "./Recorder.svelte";
  import {processText} from '../helpers.js';

  export let noteContent = ""

  let recordingText = `Press the Play button to Start recording.`;

  let SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = new SpeechRecognition();

   /** Voice API Logic Start**/
   recognition.continuous = true;

  recognition.onresult = function(event) {
    let current = event.resultIndex;
    let transcript = event.results[current][0].transcript;
    noteContent += transcript;
  };

  recognition.onstart = function() {
    recordingText =
      "Voice recognition Started. Try speaking into the microphone.";
  };

  recognition.onspeechend = function() {
    recordingText = "Voice recognition turned off.";
  };

  recognition.onerror = function(event) {
    if (event.error == "no-speech") {
      recordingText = "No Voice was detected. Try again.";
    }
  };

  /** Voice Listen Code **/
  function readOutLoud(message) {
    let speech = new SpeechSynthesisUtterance();
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  }

  /** Component Handlers**/
  function recorderHandler(event) {
    let type = event.detail.actionType;
    if (type === "PLAY") {
      startHandler();
    } else if (type === "PAUSE") {
      pauseHandler();
    } else if (type === "RESET") {
      resetHandler();
    } else {
    }
  }

  function startHandler() {
    if (noteContent.length) {
      noteContent += " ";
    }
    recognition.start();
  }

  function pauseHandler() {
    recognition.stop();
    recordingText = "Voice recognition paused.";
  }

  function resetHandler() {
    noteContent = "";
    recordingText = "Note reset successfully.";
    window.setTimeout(() => {
      recordingText = `Press the Play button to Start recording.`;
    }, 5000);
  }
 
  // function saveHandler() {
  //   recognition.stop();
  //   if (!noteContent.length) {
  //     recordingText =
  //       "Could not save empty note. Please add a message to your note.";
  //   } else {
  //     saveTime(new Date().toLocaleString(), noteContent);
  //     noteContent = "";
  //     times = getAllTimes();
  //     recordingText = "Note saved successfully.";
  //     window.setTimeout(() => {
  //       recordingText = `Press the Play button to Start recording.`;
  //   }, 5000);
  //   }
  // }

  function readOutLoudHandler(event) {
    let data = event.detail.content;
    readOutLoud(data);
  }

</script>

<!--Recorder Start-->
<Recorder on:recorderHandler={recorderHandler}/>
<!--Recorder End-->

<!-- {#each Object.entries(processTimes(noteContent)) as [day, arr]}
<p>{day}, {arr}</p>
{/each} -->
   
  