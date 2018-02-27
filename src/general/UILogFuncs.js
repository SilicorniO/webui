
var uiShowLogs = false;
var uiViewLogs = null;

function log(s){
	logShow(0, s);
}

function logW(s){
	logShow(1, s);
}

function logE(s){
	logShow(2, s);
}

function logI(s){
	logShow(3, s);
}

function logIView(prefix, view){
	logI("[" + prefix + "] " + view.toString());
	for(var i=0; i<view.children.length; i++){
		logIView(prefix, view.children[i])
	}
}

function logShow(type, text){
	
	if(!uiShowLogs){
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
	if(uiViewLogs){
		uiViewLogs.innerHTML += log + '<BR />';
	}
	
}

