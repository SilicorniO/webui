import UILog from "./UILog"

/**
* Get scrollbar width. 
* FROM: http://www.alexandre-gomes.com/?p=115
* @return Integer scrollbar width
**/
export function getScrollWidth() {  
    var inner = document.createElement('p');  
    inner.style.width = "100%";  
    inner.style.height = "200px";  
  
    var outer = document.createElement('div');  
    outer.style.position = "absolute";  
    outer.style.top = "0px";  
    outer.style.left = "0px";  
    outer.style.visibility = "hidden";  
    outer.style.width = "200px";  
    outer.style.height = "150px";  
    outer.style.overflow = "hidden";  
    outer.appendChild (inner);  
  
    document.body.appendChild (outer);  
    var w1 = inner.offsetWidth;  
    outer.style.overflow = 'scroll';  
    var w2 = inner.offsetWidth;  
    if (w1 == w2) w2 = outer.clientWidth;  
  
    document.body.removeChild (outer);  
  
    return (w1 - w2);  
};

//----- COUNTERS -----

var counters = {};

export function startCounter(name){
    var now = new Date().getTime();
	counters[name] = now;
}

export function endCounter(name){
    var now = new Date().getTime();
	return (now - counters[name]);
}

export function endCounterLog(name){
	UILog.log('Counter[' + name + ']: ' + endCounter(name) + 'ms');
}