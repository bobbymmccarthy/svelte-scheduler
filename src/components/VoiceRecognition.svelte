<script>
    import Recorder from "./Recorder.svelte";
    // import {processText } from "../helpers.js"
    export let noteContent = ""

    let times = getAllTimes()
    let support = true;
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
      } else if (type === "SAVE") {
        saveHandler();
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
    
  function saveTime(user, content) {
    localStorage.setItem(user, JSON.stringify(processText(content)));
  }
  function getAllTimes() {
    let times = [];
    let key;
    for (var i = 0; i < localStorage.length; i++) {
      key = localStorage.key(i);
      times.push({
        user: key,
        content: localStorage.getItem(localStorage.key(i))
      });
    }
    return times;
  }
    function saveHandler() {
    recognition.stop();

    if (!noteContent.length) {
      recordingText =
        "Could not save empty note. Please add a message to your note.";
    } else {
      saveTime(new Date().toLocaleString(), noteContent);
      noteContent = "";
      times = getAllTimes();
      recordingText = "Note saved successfully.";
      window.setTimeout(() => {
        recordingText = `Press the Play button to Start recording.`;
    }, 5000);
    }
  }
   
    function readOutLoudHandler(event) {
      let data = event.detail.content;
      readOutLoud(data);
    }
    
    console.log(times)
    
  
  </script>
  
  
  {#if support}
    <p><b>Voice Record</b> or <b>Type</b> your availablilty.<br>
      Start with the <u>day of the week</u> followed by the <i>times</i>.<br>
    For example: "I'm free <u>Monday</u> <i>9am-10am</i> and <i>11am-12pm</i>, <u>Tuesday</u> <i>except 3-4pm</i>, ..."</p>
    <!--Recorder Start-->
    <Recorder on:recorderHandler={recorderHandler}/>
    <!--Recorder End-->

    <!-- {#each Object.entries(processTimes(noteContent)) as [day, arr]}
    <p>{day}, {arr}</p>
    {/each} -->
    {#each getAllTimes() as note}
    <p>{note.content}</p>
    {/each}
   
  {/if}
  