import {processText, createSharedCalendar, getTopNTimes} from './helpers.js';


let available1 = processText(text1);
let available2 = processText(text2);
let available3 = processText(text3);
let allUserTimes = [{user: 'user1', availableTimes: available1}, {user: 'user2', availableTimes: available2}, {user: 'user3', availableTimes: available3}];
createSharedCalendar(allUserTimes);
getTopNTimes(allUserTimes, 10);