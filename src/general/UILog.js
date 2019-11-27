
function UILog() {

	this.uiShowLogs = false;
	this.uiViewLogs = null;

	this.log = (s) => {
		this.logShow(0, s);
	}

	this.logW = (s) => {
		this.logShow(1, s);
	}

	this.logE = (s) => {
		this.logShow(2, s);
	}

	this.logI = (s) =>{
		this.logShow(3, s);
	}

	
}

UILog.prototype.logIView = (prefix, view) => {
	this.logI("[" + prefix + "] " + view.toString());
	view.forEachChild(function(child, index){
		logIView(prefix, child)
	});
}

UILog.prototype.logShow = function(type, text){
	
	if(!this.uiShowLogs){
		return;
	}
	
	//prepare log
	var log = text;
	switch(type){
		case 1: log = "WARNING: " + log; break;
		case 2: log = "ERROR: " + log; break;
		case 3: log = "INFO: " + log; break;
	}
	
	//show in console
	console.log(log);
	
	//show in view if there is one
	if(this.uiViewLogs){
		this.uiViewLogs.innerHTML += log + '<BR />';
	}
	
}

const log = new UILog()
export default log