/* --- Corn ---*/
var schedule = require('node-schedule');

/* --- Every 1 minute --- */
let scheduleMin = ()=> {
	var j = schedule.scheduleJob('*/1 * * * *', function(fireDate) {
    	console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
	});
}

module.exports = {
    scheduleMin
};