<script>
    // used https://github.com/karkranikhil/voice-notes to learn how to use web speech api in svelte
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
  
    let isActive = false;
    function playHandler() {
      isActive = !isActive;
    }
  
    function iconHandler(type) {
      if (type === "PLAY" || type === "PAUSE") {
        isActive = !isActive;
      }
      let actionType =
        type === "PLAY" && isActive
          ? "PLAY"
          : type === "PLAY" && !isActive
          ? "PAUSE"
          : type;
      console.log(actionType);
      dispatch("recorderHandler", {
        actionType: actionType
      });
    }
</script>

<div>
    <button border="2px solid black" background-color="orange" on:click={() => iconHandler('PLAY')}>{isActive ? 'Pause' : 'Record'}</button>
    <button on:click={() => iconHandler('RESET')}>RESET</button>
    <!-- <button on:click={() => iconHandler('SAVE')}>SAVE</button>  -->
    {#if isActive}
      <p>Recording...</p>
    {/if}
  
</div>