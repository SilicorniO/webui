
/** 
 * @constructor
*/
function UIRedrawTimer(){
	this.time = null;
}

/**
* Catch a lot of requests and call to callback once after timeout
* @param cb Callback to call when it is time to redraw
* @param timeMillis milliseconds to wait
**/
UIRedrawTimer.prototype.timer = function(cb, timeMillis){

	if(!timeMillis){
		timeMillis = 20;
	}

	//start the timer if not started
	if(!this.time){
		this.timerLauncher(timeMillis, cb);
	}

	//update the time
	var waiting = !this.time;
	this.time = (new Date()).getTime();
	this.time += timeMillis;
}

UIRedrawTimer.prototype.timerLauncher = function(timeInMillis, cb){
	setTimeout((function(){

		//check time is after timer
		var now = (new Date()).getTime();
		if(now > this.time){

			//redraw
			cb();

			//clean the timer
			this.time = null;
		}else{

			//run timer again with rest of milliseconds
			this.timerLauncher(this.time - now, cb);
		}

	}).bind(this), timeInMillis)
}