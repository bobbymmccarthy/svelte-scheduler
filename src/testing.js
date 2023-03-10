import {processText, createSharedCalendar, getTopNTimes} from './helpers.js';

// Test texts
let text1 = "monday 9-10am, 11-1pm, 5:30-6:30pm, 7:30-8:30pm, tuesday all day, wednesday except 2-3pm and 4-5pm, thursday 9-7pm";
let text2 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:30pm-3:30pm, thursday all day";
let text3 = "monday 10:30am-5pm, tuesday 9am-1pm, wednesday 2:45pm-3:30pm, thursday all day";


let available1 = processText(text1);
let available2 = processText(text2);
let available3 = processText(text3);
let allUserTimes = [{user: 'user1', availableTimes: available1}, {user: 'user2', availableTimes: available2}, {user: 'user3', availableTimes: available3}];
createSharedCalendar(allUserTimes);
getTopNTimes(allUserTimes, 10);