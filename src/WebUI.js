
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

	//ids of nodes changed
	this.nodesAdded = [];
	this.nodesRemoved = [];

	//controllers
	this.uiViewsManager = new UIViewsManager();
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

			//when a node is added we have to check the relationship with the rest of views

			//TODO change fot not calculating all every time
			this.drawScreens();
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
	this.drawScreens();
	
	//listen dom events
	this.listenDomEvents();
	
}

WebUI.prototype.listenDomEvents = function(){
	
	var self = this;
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeInserted", function (event) {
		self.nodesAdded.push(event.srcElement);
		self.screens = [];
		self.redraw();
	}, false);
	
	document.getElementsByTagName('BODY')[0].addEventListener("DOMNodeRemoved", function (event) {
		self.nodesRemoved.push(event.srcElement);
		self.nodesRemoved.push(event.relatedNode);
		self.screens = [];
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
WebUI.prototype.drawScreens = function(cbEvents){
    
	//start genral counter
	startCounter('all');

	//prepare all dom from body
	var bodyElement = document.getElementsByTagName("BODY")[0];
	var screens = [];
	this.uiPrepare.generateUIViews(bodyElement, this.configuration, screens);
	
	//draw all screens
	for(var i=0; i<screens.length; i++){
		
		//finish rest of calculations
		this.drawUIScreen(screens[i], cbEvents);
	}

}

WebUI.prototype.drawUIScreen = function(screen, cbEvents){

	//---- PREPARE -----
	startCounter('prepare');
	startCounter('loadSizes');

	//update the size of the screen
	this.uiPrepare.loadSizeScreen(screen);
						
	//load sizes of views
	this.uiPrepare.loadSizesSlow(screen.getChildElements(), this.configuration);

	endCounterLog('loadSizes');
	startCounter('orderViews');
	
	//order views
	this.uiPrepare.orderViews(screen);
	
	endCounterLog('orderViews');
	endCounterLog('prepare');
	
	//---- CORE -----
	startCounter('core');
	
	//assign position and sizes to screen
	this.uiCore.calculateScreen(screen);
	
	endCounterLog('core');
				
	//---- DRAW -----
	startCounter('draw');
				
	//apply position and sizes
	var childrenSizes = this.uiDraw.applyPositions(screen, this.configuration.viewColors);
	
	//resize screen if necessary
	this.uiDraw.applySizeScreen(screen, childrenSizes.maxX, childrenSizes.maxY);

	endCounterLog('draw');

	//call to listener of events
	if(cbEvents){
		cbEvents({
			'name': 'end'
		});
	}
	
	//end counter
	endCounterLog('all');
}

var WebUIInstance = new WebUI();
window['WebUI'] = WebUIInstance;
window['WebUI']['start'] = WebUIInstance.start;
window['WebUI']['refresh'] = WebUIInstance.refreshUI;