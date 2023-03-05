<script>
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
    <button on:click={() => iconHandler('PLAY')}>{isActive ? 'Pause' : 'Record'}</button>
    <button on:click={() => iconHandler('RESET')}>RESET</button> 
    {#if isActive}
      <p>Recording...</p>
    {/if}
  
</div>