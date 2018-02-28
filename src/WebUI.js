
//Static classess
var UIViewUtilsInstance = new UIViewUtils();
var UIUtilsInstance = new UIUtils();

/**  
 * @constructor
*/
function WebUI(){

	/** Configuration saved **/
	this.uiConfiguration;

	//size of scrollbars to use as padding when views have scrollbars visible
	this.scrollWidth = 0;
	this.scrollHeight = 0;

	/** Identifier to use when call to refresh the framework **/
	this.idUI = null;

	//controllers
	this.uiPrepare = new UIPrepare(this.refreshUI);
	this.uiDraw = new UIDraw();
	this.uiCore = null;

	//configuration
	this.configuration = null;

	//timer for repainting
	this.redrawTimer = new UIRedrawTimer();

	//redraw function
	this.redraw = function() {

		this.redrawTimer.timer((function(){
			//TODO change fot not calculating all every time
			this.drawUIAll();
		}).bind(this), this.configuration.timeRedraw);
	}
}

/**
 * Start running the webUI listening for dom changes and initial start
 * @param {UIConfiguration} configuration 
 */
WebUI.prototype.start = function(configuration){
	
	//calculate the size of scrollbars
    if(this.scrollWidth==0){
        this.scrollWidth = getScrollWidth();
    } 
	
	//save configuration
	this.configuration = new UIConfiguration(configuration);
	
	//apply global values for logs
	uiShowLogs = this.configuration.showLogs;
	uiViewLogs = this.configuration.logsView;
	
	//prepare core with the configuration
	this.uiCore = new UICore(this.scrollWidth);
	
	//start running on actual dom
	this.drawUIAll();
	
	//listen dom events
	this.listenDomEvents();
	
}

WebUI.prototype.listenDomEvents = function(){
	
	var self = this;
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeInserted", function (event) {
		self.redraw();
	}, false);
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeRemoved", function (event) {
		self.redraw();
	}, false);
	
	//execute draw each time the size of screen is modified
	window.onresize = function(e){
		self.configuration.refreshScreenSize();
		self.redraw();
	}
	
}

/**
* Refresh the UI framework with the identifier saved if there was one
**/
WebUI.prototype.refreshUI = function(){
	this.redraw();
}

/**
* Execute UI
* @param {Function=} cbEvents where to return the data with information
**/
WebUI.prototype.drawUIAll = function(cbEvents){
    
	//start genral counter
	startCounter('all');
	
	//search all the screens
	var screens = this.uiPrepare.getAllScreens(null, null, this.configuration.attribute);

	//draw all screens
	for(var i=0; i<screens.length; i++){
		this.drawUIForId(screens[i], cbEvents);
	}

}

/**
* Execute UI for an ID
* @param id identifier of element in HTML
**/
WebUI.prototype.drawUIForId = function(id, cbEvents){

	//start genral counter
	startCounter('all');
		
	//get the element with the ID
	var ele = document.getElementById(id);
	if(ele == null){
		logE("Error getting element with ID: " + id);
		return;
	}
	
	//read views from html
	var views = this.uiPrepare.getChildrenViews(id, ele, this.configuration);
	
	//create screen and add it in the first position
	var screenView = new UIViewScreen(id, ele, views, this.configuration);
	
	//update the size of the screen
	this.uiPrepare.loadSizeScreen(screenView, ele);
			
	//set the position of parent as relative because the children will be absolute
	ele.style.position = "relative";
	
	//finish rest of calculations
	this.drawUIScreen(screenView, cbEvents);

}

WebUI.prototype.drawUIScreen = function(screenView, cbEvents){
					
	//hide screen
	document.getElementById(screenView.id).style.opacity = '0.2';

	//---- PREPARE -----
	startCounter('prepare');
	startCounter('loadSizes');
						
	//load sizes of views
	this.uiPrepare.loadSizesSlow(screenView.children, this.configuration);

	endCounterLog('loadSizes');
	startCounter('orderViews');
	
	//order views
	this.uiPrepare.orderViews(screenView);
	
	endCounterLog('orderViews');
	endCounterLog('prepare');
	
	//---- CORE -----
	startCounter('core');
	
	//assign position and sizes to screen
	this.uiCore.calculateScreen(this.uiPrepare, screenView);
	
	endCounterLog('core');
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = this.uiDraw.applyPositions(screenView.children, this.configuration.viewColors);
	
	//resize screen if necessary
	this.uiDraw.applySizeScreen(screenView, childrenSizes.maxX, childrenSizes.maxY);

	endCounterLog('draw');

	//call to listener of events
	if(cbEvents){
		cbEvents({
			'name': 'end'
		});
	}

	//show screen
	document.getElementById(screenView.id).style.opacity = '1.0';
	
	//end counter
	endCounterLog('all');
}

var WebUIInstance = new WebUI();
window['WebUI'] = WebUIInstance;
window['WebUI']['start'] = WebUIInstance.start;
window['WebUI']['refresh'] = WebUIInstance.refreshUI;