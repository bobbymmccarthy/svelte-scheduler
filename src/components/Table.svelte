<script>
 export let timeArr;
 const dayArr = ['Monday', "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
 function modifyAvail(i, j){
    timeArr[i][j] = !timeArr[i][j];
  }
</script>

<style>
    table{
      margin-left: auto;
      margin-right: auto;
    }
    table, th, td {
    border: 1px solid;
    border-collapse: collapse;
  }
    td {
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 10px;
      padding-bottom: 10px;
      min-width: 40px;
    }
    .available {
      background-color: green;
    }
  
  </style>

<table>
    <tr>
        {#each dayArr as day}
        <th>{day}</th>
        {/each}
        </tr>
        {#each timeArr as hour, i}
    <tr>
        {#each hour as day, j}
        <!-- If table[i][j] is true then the block is green-->
        <td class:available = {day} on:click = {() => modifyAvail(i,j)}></td>
        {/each}
    </tr>
    {/each}
</table>